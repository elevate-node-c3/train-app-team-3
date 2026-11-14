import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, IsNull, Not, QueryFailedError } from 'typeorm';
import { randomUUID } from 'crypto';

import { Timetable } from '../timetable/timetable.entity';
import { DatedTrip, DatedTripStatus } from '../datedTrip/dated-trip.entity';
import { DatedTripStop } from '../dated-trip-stop/dated-trip-stop.entity';
import { TripCoach } from '../trip-coach/trip-coach.entity';
import { OutboxEncryptionService } from 'libs/outbox/outbox-encryption.service';
import { OutboxEvent } from 'libs/outbox/outbox.entity';
import { CATALOG_ROUTING_KEYS, TripPublishedEvent } from '../../events/catalog.events';
import { addDays, cairoDateOf, resolveStopInstant, weekdayOf } from './cairo-time';
import { loadPublishingInputs } from './publishing-inputs';

/** 30-day booking window + 7 days margin, regenerated every run (see README). */
export const BOOKING_WINDOW_DAYS = 30;
export const GENERATION_MARGIN_DAYS = 7;
export const GENERATION_HORIZON_DAYS = BOOKING_WINDOW_DAYS + GENERATION_MARGIN_DAYS;

export interface GenerationSummary {
  generated: number;
  skipped: number;
  failed: { timetableId: string; serviceDate: string; reason: string }[];
}

const toDateOnly = (value: Date | string) =>
  value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);

const isUniqueViolation = (error: unknown) =>
  error instanceof QueryFailedError &&
  (error.driverError as { code?: string } | undefined)?.code === '23505';

@Injectable()
export class TripGenerationService {
  private readonly logger = new Logger(TripGenerationService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly encryption: OutboxEncryptionService,
  ) {}

  /** Fills every missing day of [today, today + horizon). Idempotent: running it twice creates nothing new. */
  async generateWindow(timetableId?: string): Promise<GenerationSummary> {
    const total: GenerationSummary = { generated: 0, skipped: 0, failed: [] };
    const today = cairoDateOf(Date.now());

    for (let day = 0; day < GENERATION_HORIZON_DAYS; day++) {
      const result = await this.generateForDate(addDays(today, day), timetableId);
      total.generated += result.generated;
      total.skipped += result.skipped;
      total.failed.push(...result.failed);
    }

    return total;
  }

  async generateForDate(serviceDate: string, timetableId?: string): Promise<GenerationSummary> {
    if (!this.isValidDate(serviceDate)) {
      throw new BadRequestException('Invalid service date');
    }

    const summary: GenerationSummary = { generated: 0, skipped: 0, failed: [] };

    const timetables = await this.dataSource.getRepository(Timetable).find({
      where: {
        status: true,
        publishedAt: Not(IsNull()),
        ...(timetableId ? { id: timetableId } : {}),
      },
      relations: { train: { typeOfTrain: true } },
    });

    for (const timetable of timetables) {
      if (!this.runsOn(timetable, serviceDate)) continue;

      try {
        const trip = await this.dataSource.transaction((manager) =>
          this.createTrip(manager, timetable, serviceDate),
        );
        if (trip) summary.generated++;
        else summary.skipped++;
      } catch (error) {
        if (isUniqueViolation(error)) {
          summary.skipped++; // another instance created it first
          continue;
        }
        const reason = error instanceof Error ? error.message : String(error);
        summary.failed.push({ timetableId: timetable.id, serviceDate, reason });
        this.logger.error(`Trip ${timetable.id} on ${serviceDate} failed: ${reason}`);
      }
    }

    return summary;
  }

  /** One trip on request (the manual "create dated trip" path). It goes through the same outbox. */
  async generateOne(timetableId: string, serviceDate: string): Promise<DatedTrip> {
    if (!this.isValidDate(serviceDate)) {
      throw new BadRequestException('Invalid service date');
    }

    const timetable = await this.dataSource.getRepository(Timetable).findOne({
      where: { id: timetableId },
      relations: { train: { typeOfTrain: true } },
    });

    if (!timetable) throw new NotFoundException('Timetable not found');
    if (!timetable.status || !timetable.publishedAt) {
      throw new BadRequestException('Timetable is not published');
    }
    if (!this.runsOn(timetable, serviceDate)) {
      throw new BadRequestException('The timetable does not run on this date');
    }

    try {
      const trip = await this.dataSource.transaction((manager) =>
        this.createTrip(manager, timetable, serviceDate),
      );
      if (!trip) throw new ConflictException('A trip already exists for this train and date');
      return trip;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('A trip already exists for this train and date');
      }
      throw error;
    }
  }

  /** One trip, its stops, its coaches and the outbox event: all or nothing. Returns null if it already exists. */
  private async createTrip(
    manager: EntityManager,
    timetable: Timetable,
    serviceDate: string,
  ): Promise<DatedTrip | null> {
    const tripRepo = manager.getRepository(DatedTrip);

    const existing = await tripRepo.count({
      where: { train: { id: timetable.train.id }, serviceDate },
    });
    if (existing > 0) return null;

    const { stops, coaches } = await loadPublishingInputs(manager, timetable);

    const resolved = this.resolveStops(timetable.id, serviceDate, stops);

    const trip = await tripRepo.save(
      tripRepo.create({
        serviceDate,
        status: DatedTripStatus.PUBLISHED,
        timetableVersion: timetable.version,
        train: { id: timetable.train.id },
        timetable: { id: timetable.id },
      }),
    );

    const stopRepo = manager.getRepository(DatedTripStop);
    await stopRepo.save(
      resolved.map((stop) =>
        stopRepo.create({
          position: stop.position,
          arrivalTime: stop.arrivalTime,
          departureTime: stop.departureTime,
          arrivalAt: stop.arrivalMs === null ? null : new Date(stop.arrivalMs),
          departureAt: stop.departureMs === null ? null : new Date(stop.departureMs),
          arrivalDate: stop.arrivalMs === null ? null : cairoDateOf(stop.arrivalMs),
          departureDate: stop.departureMs === null ? null : cairoDateOf(stop.departureMs),
          datedTrip: { id: trip.id },
          station: { id: stop.stationId },
        }),
      ),
    );

    const tripCoachRepo = manager.getRepository(TripCoach);
    await tripCoachRepo.save(
      coaches.map((coach, index) =>
        tripCoachRepo.create({
          position: index + 1,
          datedTrip: { id: trip.id },
          coach: { id: coach.id },
        }),
      ),
    );

    const eventId = randomUUID();
    const type = timetable.train.typeOfTrain;

    const payload: TripPublishedEvent = {
      version: 1,
      eventId,
      eventType: 'trip-published',
      occurredAt: new Date().toISOString(),
      tripId: trip.id,
      trainId: timetable.train.id,
      trainNumber: timetable.train.number,
      trainType: { id: type.id, nameAr: type.name_ar, nameEn: type.name_en },
      timetableId: timetable.id,
      timetableVersion: timetable.version,
      serviceDate,
      stops: resolved.map((stop) => ({
        stationId: stop.stationId,
        position: stop.position,
        arrivalTime: stop.arrivalTime,
        departureTime: stop.departureTime,
        arrivalAt: stop.arrivalMs === null ? null : new Date(stop.arrivalMs).toISOString(),
        departureAt: stop.departureMs === null ? null : new Date(stop.departureMs).toISOString(),
        arrivalDate: stop.arrivalMs === null ? null : cairoDateOf(stop.arrivalMs),
        departureDate: stop.departureMs === null ? null : cairoDateOf(stop.departureMs),
      })),
      coaches: coaches.map((coach) => ({
        coachId: coach.id,
        coachNumber: coach.coachNumber,
        class: {
          id: coach.classOfTrain.id,
          nameAr: coach.classOfTrain.name_ar,
          nameEn: coach.classOfTrain.name_en,
        },
        layoutId: coach.coachLayout.id,
        seats: [...coach.coachLayout.seats]
          .sort(
            (a, b) =>
              a.rowNumber - b.rowNumber ||
              (a.side === b.side ? 0 : a.side === 'LEFT' ? -1 : 1) ||
              a.position - b.position,
          )
          .map((seat) => ({
            seatNumber: seat.seatNumber,
            rowNumber: seat.rowNumber,
            position: seat.position,
            side: seat.side,
            adjacencyGroup: seat.adjacencyGroup,
          })),
      })),
    };

    const outboxRepo = manager.getRepository(OutboxEvent);
    await outboxRepo.save(
      outboxRepo.create({
        eventId,
        routingKey: CATALOG_ROUTING_KEYS.TRIP_PUBLISHED,
        payload: this.encryption.encryptPayload(payload),
        sentAt: null,
      }),
    );

    return trip;
  }

  private resolveStops(
    timetableId: string,
    serviceDate: string,
    stops: { station: { id: string }; arrivalTime: string | null; departureTime: string | null }[],
  ) {
    try {
      let previous: number | null = null;

      return stops.map((stop, index) => {
        let arrivalMs: number | null = null;
        let departureMs: number | null = null;

        if (stop.arrivalTime) {
          arrivalMs = resolveStopInstant(serviceDate, stop.arrivalTime, previous);
          previous = arrivalMs;
        }
        if (stop.departureTime) {
          departureMs = resolveStopInstant(serviceDate, stop.departureTime, previous);
          previous = departureMs;
        }

        return {
          position: index + 1, // stable, contiguous, independent of the timetable's stopOrder values
          stationId: stop.station.id,
          arrivalTime: stop.arrivalTime,
          departureTime: stop.departureTime,
          arrivalMs,
          departureMs,
        };
      });
    } catch (error) {
      throw new BadRequestException(
        `Timetable ${timetableId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private runsOn(timetable: Timetable, serviceDate: string): boolean {
    return (
      serviceDate >= toDateOnly(timetable.effectiveFrom) &&
      serviceDate <= toDateOnly(timetable.effectiveTo) &&
      timetable.workingDays.some((day) => day.trim().toLowerCase() === weekdayOf(serviceDate))
    );
  }

  private isValidDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }
}