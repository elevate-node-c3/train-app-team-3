import { TripSearchQuery } from './trip-search.model';

export const TRIP_AVAILABILITY_PROVIDER = Symbol(
  'TRIP_AVAILABILITY_PROVIDER',
);

export interface TripAvailabilityProvider {
  getAvailability(
    query: TripSearchQuery,
    tripIds: string[],
  ): Promise<Map<string, number>>;
}
