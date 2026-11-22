import { GenerationInputs, GenerationTimetable, CreateGeneratedTrip } from '../entities/trip-generation.model';
import { DatedTrip } from '../../../datedTrip/domain/entities/dated-trip.entity';

export const TRIP_GENERATION_REPOSITORY = Symbol('TRIP_GENERATION_REPOSITORY');

export type CreateGeneratedTripCommandBuilder = (
  inputs: GenerationInputs,
) => CreateGeneratedTrip;

export class TripGenerationUniqueConflictError extends Error {
  constructor() {
    super('A trip already exists for this train and date');
    this.name = 'TripGenerationUniqueConflictError';
  }
}

export interface TripGenerationRepository {
  findPublishedTimetables(timetableId?: string): Promise<GenerationTimetable[]>;
  findTimetableById(timetableId: string): Promise<GenerationTimetable | null>;
  createTrip(
    timetable: GenerationTimetable,
    serviceDate: string,
    buildCommand: CreateGeneratedTripCommandBuilder,
  ): Promise<DatedTrip | null>;
}
