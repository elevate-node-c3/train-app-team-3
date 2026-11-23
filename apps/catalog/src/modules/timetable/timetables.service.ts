import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { TimetablesRepository } from './timetables.repository';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { Timetable } from './timetable.entity';
import { TripGenerationService } from '../trip-generation/trip-generation.service';
import { loadPublishingInputs } from '../trip-generation/publishing-inputs';
import { OutboxEncryptionService } from 'libs/outbox/outbox-encryption.service';
import { OutboxEvent } from 'libs/outbox/outbox.entity';
import { CATALOG_ROUTING_KEYS, TimetablePublishedEvent } from '../../events/catalog.events';

@Injectable()
export class TimetablesService {
  private readonly logger = new Logger(TimetablesService.name);

  constructor(
    private readonly timetablesRepository: TimetablesRepository,
    private readonly dataSource: DataSource,
    private readonly tripGeneration: TripGenerationService,
    private readonly encryption: OutboxEncryptionService,
  ) {}

  create(dto: CreateTimetableDto) {
    return this.timetablesRepository.create(dto);
  }

  findAll() {
    return this.timetablesRepository.findAll();
  }

  async findOne(id: string) {
    const timetable = await this.timetablesRepository.findById(id);

    if (!timetable) {
      throw new NotFoundException('Timetable not found');
    }

    return timetable;
  }

  async update(id: string, dto: UpdateTimetableDto) {
    await this.findOne(id);
    return this.timetablesRepository.update(id, dto);
  }

  async remove(id: string) {
    const timetable = await this.findOne(id);

    if (timetable.publishedAt) {
      throw new BadRequestException(
        'A published timetable cannot be deleted; set its status to inactive instead',
      );
    }

    await this.timetablesRepository.delete(id);

    return { message: 'Timetable deleted successfully' };
  }

  /**
   * The ONE way a timetable goes live (operator and seed alike): validate stops, composition and the
   * full fare matrix, mark it published with a new version, announce it through the outbox, then
   * generate its trips for the booking window.
   */
  async publish(id: string) {
    const timetable = await this.findOne(id);

    if (!timetable.status) {
      throw new BadRequestException('Timetable is inactive');
    }

    await this.dataSource.transaction(async (manager) => {
      const locked = await manager.findOne(Timetable, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!locked) throw new NotFoundException('Timetable not found');

      await loadPublishingInputs(manager, timetable);

      const version = locked.version + 1;
      await manager.update(Timetable, { id }, { publishedAt: new Date(), version });

      const eventId = randomUUID();
      const payload: TimetablePublishedEvent = {
        version: 1,
        eventId,
        eventType: 'timetable-published',
        occurredAt: new Date().toISOString(),
        timetableId: id,
        trainId: timetable.train.id,
        timetableVersion: version,
        effectiveFrom: String(timetable.effectiveFrom).slice(0, 10),
        effectiveTo: String(timetable.effectiveTo).slice(0, 10),
      };

      const outboxRepo = manager.getRepository(OutboxEvent);
      await outboxRepo.save(
        outboxRepo.create({
          eventId,
          routingKey: CATALOG_ROUTING_KEYS.TIMETABLE_PUBLISHED,
          payload: this.encryption.encryptPayload(payload),
          sentAt: null,
        }),
      );
    });

    const summary = await this.tripGeneration.generateWindow(id);

    if (summary.failed.length) {
      // The timetable is published; the scheduler retries the failed days on its next run.
      this.logger.warn(`Timetable ${id}: ${summary.failed.length} trips failed to generate`);
    }

    return summary;
  }
}