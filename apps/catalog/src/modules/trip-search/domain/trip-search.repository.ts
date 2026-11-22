import {
  TripSearchCandidate,
  TripSearchClass,
  TripSearchQuery,
  TripSearchStation,
} from './trip-search.model';

export const TRIP_SEARCH_REPOSITORY = Symbol('TRIP_SEARCH_REPOSITORY');

export interface TripSearchRepository {
  findStation(id: string): Promise<TripSearchStation | null>;
  findSeatClass(id: string): Promise<TripSearchClass | null>;
  hasTrainNumber(number: number): Promise<boolean>;
  hasRoute(
    originStationId: string,
    destinationStationId: string,
    trainNumber?: number,
  ): Promise<boolean>;
  findCandidates(
    query: TripSearchQuery,
    faresEffectiveAt: Date,
  ): Promise<TripSearchCandidate[]>;
}
