import { Injectable } from '@nestjs/common';
import { DataSource, IsNull, Not, QueryFailedError } from 'typeorm';
import { OutboxEncryptionService } from 'libs/outbox/outbox-encryption.service';
import { OutboxEvent } from 'libs/outbox/outbox.entity';
import { CATALOG_ROUTING_KEYS } from '../../../../events/catalog.events';
import { TimetableOrmEntity } from '../../../timetable/infrastructure/entities/timetable.typeorm.entity';
import { DatedTrip, DatedTripStatus } from '../../../datedTrip/domain/entities/dated-trip.entity';
import { DatedTrip as DatedTripOrmEntity } from '../../../datedTrip/infrastructure/entities/dated-trip.typeorm.entity';
import { DatedTripStop } from '../../../dated-trip-stop/infrastructure/entities/dated-trip-stop.typeorm.entity';
import { TripCoach } from '../../../trip-coach/infrastructure/entities/trip-coach.typeorm.entity';
import { TimeTableStopOrmEntity } from '../../../timetableStops/infrastructure/entities/timetable-stop.typeorm.entity';
import { CoachOrmEntity } from '../../../coach/infrastructure/entities/coach.typeorm.entity';
import { Fare } from '../../../fare/infrastructure/entities/fare.typeorm.entity';
import {
  GenerationTimetable,
  GenerationInputs,
  CreateGeneratedTrip,
} from '../../domain/entities/trip-generation.model';
import {
  CreateGeneratedTripCommandBuilder,
  TripGenerationRepository,
  TripGenerationUniqueConflictError,
} from '../../domain/repositories/trip-generation.repository';
import { DatedTripMapper } from '../../../datedTrip/infrastructure/mapper/dated-trip.mapper';
import { TripGenerationMapper } from '../mappers/trip-generation.mapper';
import { loadPublishingInputs } from '../persistence/queries/publishing-inputs';

const isUniqueViolation = (error: unknown) =>
  error instanceof QueryFailedError &&
  (error.driverError as { code?: string } | undefined)?.code === '23505';

@Injectable()
export class TypeOrmTripGenerationRepository implements TripGenerationRepository {
  constructor(
    private readonly dataSource: DataSource,
    private readonly encryption: OutboxEncryptionService,
  ) {}

  async findPublishedTimetables(timetableId?: string): Promise<GenerationTimetable[]> {
    const timetables = await this.dataSource.getRepository(TimetableOrmEntity).find({
      where: {
        status: true,
        publishedAt: Not(IsNull()),
        ...(timetableId ? { id: timetableId } : {}),
      },
      relations: { train: { typeOfTrain: true } },
    });
    return timetables.map(TripGenerationMapper.toTimetable);
  }

  async findTimetableById(timetableId: string): Promise<GenerationTimetable | null> {
    const timetable = await this.dataSource.getRepository(TimetableOrmEntity).findOne({
      where: { id: timetableId },
      relations: { train: { typeOfTrain: true } },
    });
    return timetable ? TripGenerationMapper.toTimetable(timetable) : null;
  }

  async createTrip(
    timetable: GenerationTimetable,
    serviceDate: string,
    buildCommand: CreateGeneratedTripCommandBuilder,
  ): Promise<DatedTrip | null> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const tripRepo = manager.getRepository(DatedTripOrmEntity);
        const existing = await tripRepo.count({
          where: {
            train: { id: timetable.train.id },
            serviceDate,
          },
        });
        if (existing > 0) return null;

        const publishingInputs = await loadPublishingInputs(manager, timetable);
        const inputs: GenerationInputs = TripGenerationMapper.toInputs(
          publishingInputs.stops,
          publishingInputs.coaches,
          publishingInputs.fares,
        );
        const command: CreateGeneratedTrip = buildCommand(inputs);

        const trip = await tripRepo.save(
          tripRepo.create({
            id: command.id,
            serviceDate: command.serviceDate,
            status: DatedTripStatus.PUBLISHED,
            timetableVersion: command.timetable.version,
            train: { id: command.timetable.train.id },
            timetable: { id: command.timetable.id },
          }),
        );

        const stopRepo = manager.getRepository(DatedTripStop);
        await stopRepo.save(
          command.stops.map((stop) =>
            stopRepo.create({
              position: stop.position,
              arrivalTime: stop.arrivalTime,
              departureTime: stop.departureTime,
              arrivalAt: stop.arrivalMs === null ? null : new Date(stop.arrivalMs),
              departureAt: stop.departureMs === null ? null : new Date(stop.departureMs),
              arrivalDate: stop.arrivalDate,
              departureDate: stop.departureDate,
              datedTrip: { id: trip.id },
              station: { id: stop.stationId },
            }),
          ),
        );

        const tripCoachRepo = manager.getRepository(TripCoach);
        await tripCoachRepo.save(
          command.coaches.map((coach, index) =>
            tripCoachRepo.create({
              position: index + 1,
              datedTrip: { id: trip.id },
              coach: { id: coach.id },
            }),
          ),
        );

        const event = TripGenerationMapper.toPublishedEvent(command, trip.id);
        const outboxRepo = manager.getRepository(OutboxEvent);
        await outboxRepo.save(
          outboxRepo.create({
            eventId: event.eventId,
            routingKey: CATALOG_ROUTING_KEYS.TRIP_PUBLISHED,
            payload: this.encryption.encryptPayload(event),
            sentAt: null,
          }),
        );

        return DatedTripMapper.toDomain(trip);
      });
    } catch (error) {
      if (isUniqueViolation(error)) throw new TripGenerationUniqueConflictError();
      throw error;
    }
  }
}
