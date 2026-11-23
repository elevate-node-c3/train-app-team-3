import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { Timetable } from '../timetable/timetable.entity';
import { DatedTrip, DatedTripStatus } from './dated-trip.entity';
import { DatedTripRepository } from './dated-trip.repository';
import { CreateDatedTripDto } from './dto/create-dated-trip.dto';
import { UpdateDatedTripDto } from './dto/update-dated-trip.dto';
import { TripGenerationService } from '../trip-generation/trip-generation.service';
import { OutboxEncryptionService } from 'libs/outbox/outbox-encryption.service';
import { OutboxEvent } from 'libs/outbox/outbox.entity';
import { CATALOG_ROUTING_KEYS, TripWithdrawnEvent } from '../../events/catalog.events';

@Injectable()
export class DatedTripService {
  constructor(
    private readonly tripRepository: DatedTripRepository,
    private readonly dataSource: DataSource,
    private readonly tripGeneration: TripGenerationService,
    private readonly encryption: OutboxEncryptionService,
  ) {}

  async create(dto: CreateDatedTripDto) {
    const timetable = await this.dataSource.getRepository(Timetable).findOne({
      where: { id: dto.timetableId },
      relations: { train: true },
    });

    if (!timetable) {
      throw new NotFoundException('Timetable not found');
    }

    if (timetable.train.id !== dto.trainId) {
      throw new BadRequestException('Timetable does not belong to this train');
    }

    const trip = await this.tripGeneration.generateOne(dto.timetableId, dto.serviceDate);

    return this.findOne(trip.id);
  }

  async findAll() {
    return this.tripRepository.findAll();
  }

  async findOne(id: string) {
    const trip = await this.tripRepository.findById(id);

    if (!trip) {
      throw new NotFoundException('Dated trip not found');
    }

    return trip;
  }

  /** The only supported change: withdraw a trip that will no longer run. */
  async update(id: string, dto: UpdateDatedTripDto) {
    if (dto.status !== DatedTripStatus.CANCELLED) {
      throw new BadRequestException(
        'Trips are published when generated; the only supported change is CANCELLED (withdraw)',
      );
    }

    await this.withdraw(id);

    return this.findOne(id);
  }

  /** Marks the trip withdrawn and announces it in the same transaction. Safe to call twice. */
  async withdraw(id: string) {
    await this.dataSource.transaction(async (manager) => {
      const locked = await manager.findOne(DatedTrip, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!locked) throw new NotFoundException('Dated trip not found');
      if (locked.status === DatedTripStatus.CANCELLED) return;

      const trip = await manager.findOne(DatedTrip, {
        where: { id },
        relations: { train: true },
      });
      if (!trip) throw new NotFoundException('Dated trip not found');

      await manager.update(DatedTrip, { id }, { status: DatedTripStatus.CANCELLED });

      const eventId = randomUUID();
      const payload: TripWithdrawnEvent = {
        version: 1,
        eventId,
        eventType: 'trip-withdrawn',
        occurredAt: new Date().toISOString(),
        tripId: trip.id,
        trainId: trip.train.id,
        serviceDate: String(trip.serviceDate).slice(0, 10),
      };

      const outboxRepo = manager.getRepository(OutboxEvent);
      await outboxRepo.save(
        outboxRepo.create({
          eventId,
          routingKey: CATALOG_ROUTING_KEYS.TRIP_WITHDRAWN,
          payload: this.encryption.encryptPayload(payload),
          sentAt: null,
        }),
      );
    });
  }

  async remove(id: string) {
    const trip = await this.tripRepository.findById(id);

    if (!trip) {
      throw new NotFoundException('Dated trip not found');
    }

    if (trip.status !== DatedTripStatus.DRAFT) {
      throw new BadRequestException(
        'Only a draft trip can be deleted; withdraw a published trip instead',
      );
    }

    await this.tripRepository.remove(trip);

    return { message: 'Dated trip deleted successfully' };
  }
}