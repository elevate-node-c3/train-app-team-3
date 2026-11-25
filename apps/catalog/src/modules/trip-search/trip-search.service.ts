import { status } from '@grpc/grpc-js';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { CacheService } from 'libs/cache/src';
import {
  SearchTripsRequest,
  SearchTripsResponse,
  TripResult,
  TripSort,
} from '@app/contracts/generated/catalog';
import { normalizeSearchNumber } from '../../../../../libs/contracts/src/search-number';
import {
  BOOKING_WINDOW_DAYS,
  addDays,
  cairoDateOf,
  cairoIsoAt,
  isValidServiceDate,
} from '../trip-generation/domain/policies/cairo-time';
import {
  TripAvailabilityProvider,
  TRIP_AVAILABILITY_PROVIDER,
} from './domain/trip-availability.provider';
import {
  TripSearchRepository,
  TRIP_SEARCH_REPOSITORY,
} from './domain/trip-search.repository';
import {
  TripSearchCandidate,
  TripSearchQuery,
} from './domain/trip-search.model';
import {
  SALES_CLOSE_MINUTES,
  TRIP_AVAILABILITY_CACHE_TTL_SECONDS,
  TRIP_SEARCH_CACHE_TTL_SECONDS,
} from './trip-search.constants';

type SearchLanguage = 'ar' | 'en';

interface NormalizedSearch {
  language: SearchLanguage;
  query: TripSearchQuery;
  departureTimeFrom?: string;
  departureTimeTo?: string;
  maximumFarePiastres?: number;
  trainType?: string;
  sort: TripSort;
}

const cairoClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Cairo',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function isTripSearchCandidate(value: unknown): value is TripSearchCandidate {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<TripSearchCandidate>;
  return (
    typeof candidate.tripId === 'string' &&
    typeof candidate.trainId === 'string' &&
    typeof candidate.trainNumber === 'number' &&
    typeof candidate.trainTypeId === 'string' &&
    typeof candidate.originStationId === 'string' &&
    typeof candidate.destinationStationId === 'string' &&
    typeof candidate.departureAt === 'string' &&
    typeof candidate.arrivalAt === 'string' &&
    typeof candidate.farePiastres === 'number'
  );
}

function invalidField(
  field: string,
  reason: string,
  language: SearchLanguage,
): RpcException {
  const message =
    language === 'ar'
      ? `${field}: ${reason}. غيّر ${field}.`
      : `${field}: ${reason}. Change ${field}.`;
  return new RpcException({ code: status.INVALID_ARGUMENT, message });
}

function isValidClock(value: string): boolean {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function isSeatCount(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value >= 0
  );
}

@Injectable()
export class TripSearchService {
  private readonly logger = new Logger(TripSearchService.name);
  private readonly pendingLoads = new Map<
    string,
    Promise<TripSearchCandidate[]>
  >();

  constructor(
    @Inject(TRIP_SEARCH_REPOSITORY)
    private readonly repository: TripSearchRepository,
    @Inject(TRIP_AVAILABILITY_PROVIDER)
    private readonly availabilityProvider: TripAvailabilityProvider,
    private readonly cache: CacheService,
  ) {}

  async search(request: SearchTripsRequest): Promise<SearchTripsResponse> {
    const search = this.normalizeRequest(request);
    const [origin, destination, seatClass] = await Promise.all([
      this.repository.findStation(search.query.originStationId),
      this.repository.findStation(search.query.destinationStationId),
      this.repository.findSeatClass(search.query.seatClassId),
    ]);

    if (!origin || !origin.isActive) {
      throw invalidField(
        'origin_station_id',
        'must identify an active station',
        search.language,
      );
    }
    if (!destination || !destination.isActive) {
      throw invalidField(
        'destination_station_id',
        'must identify an active station',
        search.language,
      );
    }
    if (search.query.originStationId === search.query.destinationStationId) {
      throw invalidField(
        'destination_station_id',
        'must differ from origin_station_id',
        search.language,
      );
    }
    if (!seatClass) {
      throw invalidField(
        'seat_class_id',
        'must identify an existing seat class',
        search.language,
      );
    }
    if (
      search.query.trainNumber !== undefined &&
      !(await this.repository.hasTrainNumber(search.query.trainNumber))
    ) {
      throw invalidField(
        'train_number',
        'must identify an existing train',
        search.language,
      );
    }

    const candidates = await this.loadCandidates(search.query);
    const openCandidates = candidates
      .filter((candidate) => this.matchesFilters(candidate, search))
      .filter((candidate) => this.isOnSale(candidate, Date.now()));
    const availability = await this.getAvailability(
      openCandidates,
      search.query,
    );

    const trips = openCandidates
      .filter((candidate) => availability.has(candidate.tripId))
      .filter((candidate) => this.isOnSale(candidate, Date.now()))
      .map((candidate) =>
        this.toTripResult(
          candidate,
          search.query.seatClassId,
          seatClass.nameEn,
          seatClass.nameAr,
          availability.get(candidate.tripId)!,
          search.language,
        ),
      )
      .sort((left, right) => this.compareResults(left, right, search.sort));

    let emptyReason: string | undefined;
    if (trips.length === 0) {
      const routeExists = await this.repository.hasRoute(
        search.query.originStationId,
        search.query.destinationStationId,
        search.query.trainNumber,
      );
      emptyReason = this.getEmptyReason(
        search.language,
        routeExists,
        search.query.trainNumber !== undefined,
      );
    }

    return {
      trips,
      dateStrip: this.getDateStrip(search.query.departureDate),
      ...(emptyReason !== undefined && { emptyReason }),
    };
  }

  private normalizeRequest(request: SearchTripsRequest): NormalizedSearch {
    const language = request.language ?? 'en';
    if (language !== 'ar' && language !== 'en') {
      throw invalidField('language', 'must be either en or ar', 'en');
    }

    const requiredFields = [
      ['origin_station_id', request.originStationId],
      ['destination_station_id', request.destinationStationId],
      ['departure_date', request.departureDate],
      ['seat_class_id', request.seatClassId],
    ] as const;
    for (const [field, value] of requiredFields) {
      if (typeof value !== 'string' || value.length === 0) {
        throw invalidField(field, 'is required', language);
      }
    }

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        request.originStationId!,
      )
    ) {
      throw invalidField(
        'origin_station_id',
        'must be a valid station ID',
        language,
      );
    }
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        request.destinationStationId!,
      )
    ) {
      throw invalidField(
        'destination_station_id',
        'must be a valid station ID',
        language,
      );
    }
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        request.seatClassId!,
      )
    ) {
      throw invalidField('seat_class_id', 'must be a valid class ID', language);
    }

    if (!isValidServiceDate(request.departureDate!)) {
      throw invalidField(
        'departure_date',
        'must be a real date in YYYY-MM-DD format',
        language,
      );
    }
    const today = cairoDateOf(Date.now());
    const lastBookableDate = addDays(today, BOOKING_WINDOW_DAYS - 1);
    if (request.departureDate! < today) {
      throw invalidField(
        'departure_date',
        'must not be in the past',
        language,
      );
    }
    if (request.departureDate! > lastBookableDate) {
      throw invalidField(
        'departure_date',
        `must be on or before ${lastBookableDate}, the last bookable date`,
        language,
      );
    }

    let trainNumber: number | undefined;
    if (request.trainNumber !== undefined && request.trainNumber !== '') {
      const normalizedTrainNumber = normalizeSearchNumber(request.trainNumber);
      if (!/^[1-9]\d*$/.test(normalizedTrainNumber)) {
        throw invalidField(
          'train_number',
          'must contain a positive whole number',
          language,
        );
      }
      trainNumber = Number(normalizedTrainNumber);
      if (!Number.isSafeInteger(trainNumber)) {
        throw invalidField(
          'train_number',
          'must be a safe whole number',
          language,
        );
      }
    }

    for (const [field, value] of [
      ['departure_time_from', request.departureTimeFrom],
      ['departure_time_to', request.departureTimeTo],
    ] as const) {
      if (value !== undefined && !isValidClock(value)) {
        throw invalidField(field, 'must use HH:mm format', language);
      }
    }
    if (
      request.maximumFarePiastres !== undefined &&
      (!Number.isSafeInteger(request.maximumFarePiastres) ||
        request.maximumFarePiastres < 0)
    ) {
      throw invalidField(
        'maximum_fare_piastres',
        'must be a non-negative whole number of piastres',
        language,
      );
    }
    if (
      request.trainType !== undefined &&
      request.trainType.trim().length === 0
    ) {
      throw invalidField('train_type', 'must not be empty', language);
    }

    const sort = request.sort ?? TripSort.TRIP_SORT_DEPARTURE_TIME;
    if (
      sort !== TripSort.TRIP_SORT_DEPARTURE_TIME &&
      sort !== TripSort.TRIP_SORT_DURATION &&
      sort !== TripSort.TRIP_SORT_FARE
    ) {
      throw invalidField('sort', 'is not a supported sort order', language);
    }

    return {
      language,
      query: {
        originStationId: request.originStationId!,
        destinationStationId: request.destinationStationId!,
        departureDate: request.departureDate!,
        seatClassId: request.seatClassId!,
        ...(trainNumber !== undefined && { trainNumber }),
      },
      departureTimeFrom: request.departureTimeFrom,
      departureTimeTo: request.departureTimeTo,
      maximumFarePiastres: request.maximumFarePiastres,
      trainType: request.trainType,
      sort,
    };
  }

  private async loadCandidates(
    query: TripSearchQuery,
  ): Promise<TripSearchCandidate[]> {
    const key = [
      'catalog:trip-search:v1',
      query.departureDate,
      query.originStationId,
      query.destinationStationId,
      query.seatClassId,
      query.trainNumber ?? 'all',
    ].join(':');

    try {
      const cached = await this.cache.get<unknown>(key);
      if (Array.isArray(cached) && cached.every(isTripSearchCandidate)) {
        return cached;
      }
      if (cached !== null) {
        this.logger.warn(`Ignoring invalid trip-search cache value for ${key}`);
      }
    } catch (error) {
      this.logger.warn(
        `Trip-search cache read failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    const pending = this.pendingLoads.get(key);
    if (pending) return pending;

    const loading = this.repository.findCandidates(query, new Date());
    this.pendingLoads.set(key, loading);
    try {
      const candidates = await loading;
      try {
        await this.cache.set(key, candidates, TRIP_SEARCH_CACHE_TTL_SECONDS);
      } catch (error) {
        this.logger.warn(
          `Trip-search cache write failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      return candidates;
    } finally {
      this.pendingLoads.delete(key);
    }
  }

  private async getAvailability(
    candidates: TripSearchCandidate[],
    query: TripSearchQuery,
  ): Promise<Map<string, number>> {
    const availability = new Map<string, number>();
    const uncached: TripSearchCandidate[] = [];

    for (const candidate of candidates) {
      const key = this.availabilityCacheKey(candidate, query);
      try {
        const cached = await this.cache.get<unknown>(key);
        if (isSeatCount(cached)) {
          availability.set(candidate.tripId, cached);
          continue;
        }
        if (cached !== null) {
          this.logger.warn(`Ignoring invalid availability cache value for ${key}`);
        }
      } catch (error) {
        this.logger.warn(
          `Availability cache read failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      uncached.push(candidate);
    }

    if (uncached.length === 0) return availability;

    const uncachedIds = [...new Set(uncached.map((candidate) => candidate.tripId))];
    const fetched = await this.availabilityProvider.getAvailability(
      query,
      uncachedIds,
    );
    for (const candidate of uncached) {
      const availableSeats = fetched.get(candidate.tripId);
      if (availableSeats === undefined) continue;
      if (!isSeatCount(availableSeats)) {
        throw new RpcException({
          code: status.INTERNAL,
          message: 'Trip capacity provider returned an invalid seat count.',
        });
      }
      availability.set(candidate.tripId, availableSeats);
      const key = this.availabilityCacheKey(candidate, query);
      try {
        await this.cache.set(
          key,
          availableSeats,
          TRIP_AVAILABILITY_CACHE_TTL_SECONDS,
        );
      } catch (error) {
        this.logger.warn(
          `Availability cache write failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
    return availability;
  }

  private availabilityCacheKey(
    candidate: TripSearchCandidate,
    query: TripSearchQuery,
  ): string {
    return [
      'catalog:trip-availability:v1',
      candidate.tripId,
      query.seatClassId,
      query.originStationId,
      query.destinationStationId,
    ].join(':');
  }

  private matchesFilters(
    candidate: TripSearchCandidate,
    search: NormalizedSearch,
  ): boolean {
    if (
      search.maximumFarePiastres !== undefined &&
      candidate.farePiastres > search.maximumFarePiastres
    ) {
      return false;
    }
    if (
      search.trainType &&
      candidate.trainTypeId.toLowerCase() !== search.trainType.toLowerCase() &&
      candidate.trainTypeNameEn.toLowerCase() !==
        search.trainType.toLowerCase() &&
      candidate.trainTypeNameAr !== search.trainType
    ) {
      return false;
    }

    const departureClock = cairoClock.format(new Date(candidate.departureAt));
    const from = search.departureTimeFrom;
    const to = search.departureTimeTo;
    if (from && departureClock < from) {
      if (!to || from <= to || departureClock > to) return false;
    }
    if (to && departureClock > to) {
      if (!from || from <= to || departureClock < from) return false;
    }
    return true;
  }

  private isOnSale(candidate: TripSearchCandidate, now: number): boolean {
    const departureAt = Date.parse(candidate.departureAt);
    return (
      Number.isFinite(departureAt) &&
      now < departureAt - SALES_CLOSE_MINUTES * 60_000
    );
  }

  private toTripResult(
    candidate: TripSearchCandidate,
    seatClassId: string,
    seatClassNameEn: string,
    seatClassNameAr: string,
    availableSeats: number,
    language: SearchLanguage,
  ): TripResult {
    return {
      tripId: candidate.tripId,
      trainNumber: String(candidate.trainNumber),
      trainType:
        language === 'ar'
          ? candidate.trainTypeNameAr
          : candidate.trainTypeNameEn,
      seatClassId,
      seatClassName:
        language === 'ar' ? seatClassNameAr : seatClassNameEn,
      originStationId: candidate.originStationId,
      originStationNameEn: candidate.originStationNameEn,
      originStationNameAr: candidate.originStationNameAr,
      departureAt: cairoIsoAt(Date.parse(candidate.departureAt)),
      destinationStationId: candidate.destinationStationId,
      destinationStationNameEn: candidate.destinationStationNameEn,
      destinationStationNameAr: candidate.destinationStationNameAr,
      arrivalAt: cairoIsoAt(Date.parse(candidate.arrivalAt)),
      durationMinutes: candidate.durationMinutes,
      intermediateStopCount: candidate.intermediateStopCount,
      availableSeats,
      farePiastres: candidate.farePiastres,
      soldOut: availableSeats === 0,
      currencyCode: 'EGP',
    };
  }

  private getEmptyReason(
    language: SearchLanguage,
    routeExists: boolean,
    trainNumberSpecified: boolean,
  ): string {
    if (!routeExists && trainNumberSpecified) {
      return language === 'ar'
        ? 'هذا القطار لا يخدم هذا المسار؛ غيّر رقم القطار أو امسحه.'
        : 'This train does not serve this route; change or clear the train number.';
    }
    if (!routeExists) {
      return language === 'ar'
        ? 'لا يوجد قطار يسير بين هاتين المحطتين بهذا الاتجاه؛ غيّر محطتي الانطلاق والوصول.'
        : 'No train runs between these stations in this direction; change the stations.';
    }
    return language === 'ar'
      ? 'عفوا, لا يوجد مواعيد متاحة في التاريخ المختار'
      : 'Sorry, no trains available on the selected date';
  }

  private compareResults(
    left: TripResult,
    right: TripResult,
    sort: TripSort,
  ): number {
    const departureDifference =
      Date.parse(left.departureAt ?? '') - Date.parse(right.departureAt ?? '');
    const difference =
      sort === TripSort.TRIP_SORT_DURATION
        ? (left.durationMinutes ?? 0) - (right.durationMinutes ?? 0)
        : sort === TripSort.TRIP_SORT_FARE
          ? (left.farePiastres ?? 0) - (right.farePiastres ?? 0)
          : departureDifference;
    return difference || departureDifference;
  }

  private getDateStrip(selectedDate: string): string[] {
    const today = cairoDateOf(Date.now());
    const earliestStart = today;
    const latestStart = addDays(today, BOOKING_WINDOW_DAYS - 5);
    const centeredStart = addDays(selectedDate, -2);
    const start =
      centeredStart < earliestStart
        ? earliestStart
        : centeredStart > latestStart
          ? latestStart
          : centeredStart;

    return Array.from({ length: 5 }, (_, index) => addDays(start, index));
  }
}
