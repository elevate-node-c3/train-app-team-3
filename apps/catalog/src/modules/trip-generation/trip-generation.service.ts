import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatedTrip } from '../datedTrip/domain/entities/dated-trip.entity';
import {
  BOOKING_WINDOW_DAYS,
  addDays,
  cairoDateOf,
  isValidServiceDate,
  resolveStopInstant,
  timetableRunsOn,
  weekdayOf,
} from './domain/policies/cairo-time';
import {
  validateCoaches,
  validateFareMatrix,
  validateStops,
  validateWorkingDays,
} from './domain/policies/publishing-rules';
import {
  CreateGeneratedTrip,
  GenerationInputs,
  GenerationTimetable,
  ResolvedGenerationStop,
} from './domain/entities/trip-generation.model';
import {
  TRIP_GENERATION_REPOSITORY,
  TripGenerationRepository,
  TripGenerationUniqueConflictError,
} from './domain/repositories/trip-generation.repository';

/** 30-day booking window + 7 days margin, regenerated every run (see README). */
export { BOOKING_WINDOW_DAYS };
export const GENERATION_MARGIN_DAYS = 7;
export const GENERATION_HORIZON_DAYS = BOOKING_WINDOW_DAYS + GENERATION_MARGIN_DAYS;

export interface GenerationSummary {
  generated: number;
  skipped: number;
  failed: { timetableId: string; serviceDate: string; reason: string }[];
}

@Injectable()
export class TripGenerationService {
  private readonly logger = new Logger(TripGenerationService.name);

  constructor(
    @Inject(TRIP_GENERATION_REPOSITORY)
    private readonly repository: TripGenerationRepository,
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
    if (!isValidServiceDate(serviceDate)) {
      throw new BadRequestException('Invalid service date');
    }

    const summary: GenerationSummary = { generated: 0, skipped: 0, failed: [] };
    const timetables = await this.repository.findPublishedTimetables(timetableId);

    for (const timetable of timetables) {
      if (!timetableRunsOn(timetable, serviceDate)) continue;

      try {
        const trip = await this.repository.createTrip(
          timetable,
          serviceDate,
          (inputs) => {
            const stops = this.validateAndResolveStops(timetable, serviceDate, inputs);
            return this.createCommand(timetable, serviceDate, inputs, stops);
          },
        );
        if (trip) summary.generated++;
        else summary.skipped++;
      } catch (error) {
        if (error instanceof TripGenerationUniqueConflictError) {
          summary.skipped++;
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
    if (!isValidServiceDate(serviceDate)) {
      throw new BadRequestException('Invalid service date');
    }

    const timetable = await this.repository.findTimetableById(timetableId);
    if (!timetable) throw new NotFoundException('Timetable not found');
    if (!timetable.status || !timetable.publishedAt) {
      throw new BadRequestException('Timetable is not published');
    }
    if (!timetableRunsOn(timetable, serviceDate)) {
      throw new BadRequestException('The timetable does not run on this date');
    }

    try {
      const trip = await this.repository.createTrip(
        timetable,
        serviceDate,
        (inputs) => {
          const stops = this.validateAndResolveStops(timetable, serviceDate, inputs);
          return this.createCommand(timetable, serviceDate, inputs, stops);
        },
      );
      if (!trip) throw new ConflictException('A trip already exists for this train and date');
      return trip;
    } catch (error) {
      if (error instanceof TripGenerationUniqueConflictError) {
        throw new ConflictException('A trip already exists for this train and date');
      }
      throw error;
    }
  }

  private validateAndResolveStops(
    timetable: GenerationTimetable,
    serviceDate: string,
    inputs: GenerationInputs,
  ): ResolvedGenerationStop[] {
    const problems = [
      ...validateWorkingDays(timetable.workingDays),
      ...validateStops(inputs.stops),
      ...validateCoaches(
        inputs.coaches.map((coach) => ({
          coachNumber: coach.coachNumber,
          hasClass: !!coach.classOfTrain && !!coach.coachLayout,
          seats: coach.coachLayout?.seats ?? [],
        })),
      ),
    ];

    if (!problems.length) {
      problems.push(
        ...validateFareMatrix(
          inputs.stops.map((stop) => stop.stationId),
          [
            ...new Set(
              inputs.coaches.flatMap((coach) =>
                coach.classOfTrain ? [coach.classOfTrain.id] : [],
              ),
            ),
          ],
          inputs.fares,
        ),
      );
    }

    if (problems.length) {
      throw new BadRequestException(
        `Timetable ${timetable.id} cannot be published: ${problems.slice(0, 10).join('; ')}`,
      );
    }

    try {
      let previous: number | null = null;
      return inputs.stops.map((stop, index) => {
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
          ...stop,
          position: index + 1,
          arrivalMs,
          departureMs,
          arrivalDate: arrivalMs === null ? null : cairoDateOf(arrivalMs),
          departureDate: departureMs === null ? null : cairoDateOf(departureMs),
        };
      });
    } catch (error) {
      throw new BadRequestException(
        `Timetable ${timetable.id}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private createCommand(
    timetable: GenerationTimetable,
    serviceDate: string,
    inputs: GenerationInputs,
    stops: ResolvedGenerationStop[],
  ): CreateGeneratedTrip {
    const id = randomUUID();
    return { id, serviceDate, timetable, stops, coaches: inputs.coaches };
  }
}
