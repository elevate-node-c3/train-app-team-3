import { DatedTrip } from '../entities/dated-trip.entity';

export const DATED_TRIP_REPOSITORY = Symbol('DATED_TRIP_REPOSITORY');

export interface DatedTripRepository {
  findAll(): Promise<DatedTrip[]>;
  findById(id: string): Promise<DatedTrip | null>;
  findTimetableTrainId(timetableId: string): Promise<string | null>;
  delete(id: string): Promise<void>;
  withdraw(id: string): Promise<void>;
}
