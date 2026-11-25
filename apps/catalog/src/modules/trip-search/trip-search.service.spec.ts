import { CacheService } from 'libs/cache/src';
import {
  SearchTripsRequest,
  TripSort,
} from '@app/contracts/generated/catalog';
import { TripAvailabilityProvider } from './domain/trip-availability.provider';
import { TripSearchRepository } from './domain/trip-search.repository';
import { TripSearchCandidate } from './domain/trip-search.model';
import { TripSearchService } from './trip-search.service';

const originStationId = '11111111-1111-4111-8111-111111111111';
const destinationStationId = '22222222-2222-4222-8222-222222222222';
const seatClassId = '33333333-3333-4333-8333-333333333333';

function candidate(
  tripId: string,
  departureAt = '2025-10-25T08:30:00.000Z',
): TripSearchCandidate {
  return {
    tripId,
    trainId: `train-${tripId}`,
    trainNumber: 123,
    trainTypeId: 'type-id',
    trainTypeNameAr: 'قطار سريع',
    trainTypeNameEn: 'Express',
    originStationId,
    originStationNameAr: 'محطة الرمل',
    originStationNameEn: 'El Raml Station',
    destinationStationId,
    destinationStationNameAr: 'رمسيس',
    destinationStationNameEn: 'Ramsis Station',
    departureAt,
    arrivalAt: '2025-10-25T09:30:00.000Z',
    durationMinutes: 60,
    intermediateStopCount: 2,
    farePiastres: 15500,
  };
}

describe('TripSearchService', () => {
  let service: TripSearchService;
  let repository: jest.Mocked<TripSearchRepository>;
  let availabilityProvider: jest.Mocked<TripAvailabilityProvider>;
  let cache: jest.Mocked<Pick<CacheService, 'get' | 'set'>>;

  const request = (
    overrides: Partial<SearchTripsRequest> = {},
  ): SearchTripsRequest => ({
    originStationId,
    destinationStationId,
    departureDate: '2025-10-25',
    seatClassId,
    sort: TripSort.TRIP_SORT_DEPARTURE_TIME,
    ...overrides,
  });

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-10-25T07:00:00.000Z'));
    repository = {
      findStation: jest.fn().mockResolvedValue({ id: originStationId, isActive: true }),
      findSeatClass: jest.fn().mockResolvedValue({
        id: seatClassId,
        nameAr: 'اقتصادي',
        nameEn: 'Economy',
      }),
      hasTrainNumber: jest.fn().mockResolvedValue(true),
      hasRoute: jest.fn().mockResolvedValue(true),
      findCandidates: jest.fn().mockResolvedValue([]),
    };
    repository.findStation.mockImplementation(async (id) => ({
      id,
      isActive: true,
    }));
    availabilityProvider = {
      getAvailability: jest.fn().mockResolvedValue(new Map()),
    };
    cache = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
    };
    service = new TripSearchService(
      repository,
      availabilityProvider,
      cache as unknown as CacheService,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns coach capacity, keeps sold-out trips, and excludes trips without the class', async () => {
    repository.findCandidates.mockResolvedValue([
      candidate('sold-out'),
      candidate('no-matching-coach'),
      candidate('available'),
    ]);
    availabilityProvider.getAvailability.mockResolvedValue(
      new Map([
        ['sold-out', 0],
        ['available', 170],
      ]),
    );

    const result = await service.search(request());

    expect(availabilityProvider.getAvailability).toHaveBeenCalledWith(
      expect.objectContaining({ seatClassId }),
      ['sold-out', 'no-matching-coach', 'available'],
    );
    expect(result.trips).toHaveLength(2);
    expect(result.trips?.[0]).toMatchObject({
      tripId: 'sold-out',
      availableSeats: 0,
      soldOut: true,
      departureAt: '2025-10-25T11:30:00+03:00',
      currencyCode: 'EGP',
    });
    expect(result.trips?.map((trip) => trip.tripId)).not.toContain(
      'no-matching-coach',
    );
    expect(result.dateStrip).toEqual([
      '2025-10-23',
      '2025-10-24',
      '2025-10-25',
      '2025-10-26',
      '2025-10-27',
    ]);
  });

  it('normalizes Arabic train-number digits and explains when that train does not serve the route', async () => {
    repository.hasRoute.mockResolvedValue(false);

    const result = await service.search(
      request({ trainNumber: '١٢٣', language: 'en' }),
    );

    expect(repository.hasTrainNumber).toHaveBeenCalledWith(123);
    expect(repository.hasRoute).toHaveBeenCalledWith(
      originStationId,
      destinationStationId,
      123,
    );
    expect(result.trips).toEqual([]);
    expect(result.emptyReason).toBe(
      'This train does not serve this route; change or clear the train number.',
    );
  });

  it('clamps the five-day date strip to the final bookable day', async () => {
    const result = await service.search(
      request({ departureDate: '2025-11-23' }),
    );

    expect(result.dateStrip).toEqual([
      '2025-11-19',
      '2025-11-20',
      '2025-11-21',
      '2025-11-22',
      '2025-11-23',
    ]);
  });
});
