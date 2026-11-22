
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { OutboxEncryptionService } from 'libs/outbox/outbox-encryption.service';
import { OutboxEvent } from 'libs/outbox/outbox.entity';
import { CATALOG_ROUTING_KEYS, TimetablePublishedEvent } from '../../../../events/catalog.events';
import { Timetable } from '../../domain/entities/timetable.entity';
import { TimetableRepository, PublishedTimetable } from '../../domain/repositories/timetable.repository';
import { TimetableOrmEntity } from '../entities/timetable.typeorm.entity';
import { TimetableMapper } from '../mapper/timetable.mapper';
import { CreateTimetableDto } from '../../application/dtos/create-timetable.dto';
import { UpdateTimetableDto } from '../../application/dtos/update-timetable.dto';
import { loadPublishingInputs } from '../../../trip-generation/infrastructure/persistence/queries/publishing-inputs';

@Injectable()
export class TypeOrmTimetableRepository implements TimetableRepository {
  constructor(
    @InjectRepository(TimetableOrmEntity)
    private readonly timetableRepository: Repository<TimetableOrmEntity>,
    private readonly dataSource: DataSource,
    private readonly encryption: OutboxEncryptionService,
  ) {}

  async create(dto: CreateTimetableDto): Promise<Timetable> {
    const timetable = this.timetableRepository.create({
      departureTime: dto.departureTime,
      effectiveFrom: new Date(dto.effectiveFrom),
      effectiveTo: new Date(dto.effectiveTo),
      workingDays: dto.workingDays,
      status: dto.status,
      train: { id: dto.trainId },
    });

    const saved = await this.timetableRepository.save(timetable);
    const loaded = await this.findById(saved.id);
    if (!loaded) throw new Error('Created timetable could not be loaded');
    return loaded;
  }

  async findAll(): Promise<Timetable[]> {
    const timetables = await this.timetableRepository.find({
      relations: { train: true },
    });
    return timetables.map(TimetableMapper.toDomain);
  }

  async findById(id: string): Promise<Timetable | null> {
    const timetable = await this.timetableRepository.findOne({
      where: { id },
      relations: { train: true },
    });
    return timetable ? TimetableMapper.toDomain(timetable) : null;
  }

  async update(id: string, dto: UpdateTimetableDto): Promise<Timetable | null> {
    const timetable = await this.timetableRepository.findOne({
      where: { id },
      relations: { train: true },
    });

    if (!timetable) return null;

    Object.assign(timetable, {
      ...(dto.departureTime !== undefined && { departureTime: dto.departureTime }),
      ...(dto.effectiveFrom !== undefined && { effectiveFrom: new Date(dto.effectiveFrom) }),
      ...(dto.effectiveTo !== undefined && { effectiveTo: new Date(dto.effectiveTo) }),
      ...(dto.workingDays !== undefined && { workingDays: dto.workingDays }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.trainId !== undefined && { train: { id: dto.trainId } }),
    });

    await this.timetableRepository.save(timetable);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.timetableRepository.delete(id);
  }

  async publish(id: string): Promise<PublishedTimetable> {
    return this.dataSource.transaction(async (manager) => {
      const timetable = await manager.findOne(TimetableOrmEntity, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!timetable) throw new NotFoundException('Timetable not found');
      if (!timetable.status) throw new BadRequestException('Timetable is inactive');

      const withTrain = await manager.findOne(TimetableOrmEntity, {
        where: { id },
        relations: { train: true },
      });
      if (!withTrain) throw new NotFoundException('Timetable not found');
      await loadPublishingInputs(manager, withTrain);

      const version = timetable.version + 1;
      const publishedAt = new Date();
      await manager.update(TimetableOrmEntity, { id }, { publishedAt, version });

      const eventId = randomUUID();
      const payload: TimetablePublishedEvent = {
        version: 1,
        eventId,
        eventType: 'timetable-published',
        occurredAt: publishedAt.toISOString(),
        timetableId: id,
        trainId: withTrain.train.id,
        timetableVersion: version,
        effectiveFrom: String(withTrain.effectiveFrom).slice(0, 10),
        effectiveTo: String(withTrain.effectiveTo).slice(0, 10),
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

      return {
        trainId: withTrain.train.id,
        version,
        effectiveFrom: withTrain.effectiveFrom,
        effectiveTo: withTrain.effectiveTo,
      };
    });
  }
}
