import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { OutboxEncryptionService } from 'libs/outbox/outbox-encryption.service';
import { OutboxEvent } from 'libs/outbox/outbox.entity';
import { CATALOG_ROUTING_KEYS, TripWithdrawnEvent } from '../../../../events/catalog.events';
import { TimetableOrmEntity } from '../../../timetable/infrastructure/entities/timetable.typeorm.entity';
import { DatedTrip as DatedTripModel, DatedTripStatus } from '../../domain/entities/dated-trip.entity';
import { DatedTripRepository as DatedTripRepositoryPort } from '../../domain/repositories/dated-trip.repository';
import { DatedTrip } from '../entities/dated-trip.typeorm.entity';
import { DatedTripMapper } from '../mapper/dated-trip.mapper';

@Injectable()
export class TypeOrmDatedTripRepository implements DatedTripRepositoryPort {
  constructor(
    @InjectRepository(DatedTrip)
    private readonly repository: Repository<DatedTrip>,
    private readonly dataSource: DataSource,
    private readonly encryption: OutboxEncryptionService,
  ) {}

  async findAll(): Promise<DatedTripModel[]> {
    const trips = await this.repository.find({
      relations: ['train', 'timetable'],
      order: { serviceDate: 'ASC' },
    });
    return trips.map(DatedTripMapper.toDomain);
  }

  async findById(id: string): Promise<DatedTripModel | null> {
    const trip = await this.repository.findOne({
      where: { id },
      relations: ['train', 'timetable'],
    });
    return trip ? DatedTripMapper.toDomain(trip) : null;
  }

  async findTimetableTrainId(timetableId: string): Promise<string | null> {
    const timetable = await this.dataSource
      .getRepository(TimetableOrmEntity)
      .findOne({
        where: { id: timetableId },
        relations: { train: true },
      });
    return timetable?.train.id ?? null;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async withdraw(id: string): Promise<void> {
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
}
