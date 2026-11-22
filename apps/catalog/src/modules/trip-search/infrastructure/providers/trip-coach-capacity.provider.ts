import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DatedTripStatus } from '../../../datedTrip/domain/entities/dated-trip.entity';
import { TripCoach } from '../../../trip-coach/infrastructure/entities/trip-coach.typeorm.entity';
import {
  TripAvailabilityProvider as TripAvailabilityProviderPort,
} from '../../domain/trip-availability.provider';
import { TripSearchQuery } from '../../domain/trip-search.model';

@Injectable()
export class TripCoachCapacityProvider
  implements TripAvailabilityProviderPort
{
  constructor(private readonly dataSource: DataSource) {}

  async getAvailability(
    query: TripSearchQuery,
    tripIds: string[],
  ): Promise<Map<string, number>> {
    if (tripIds.length === 0) return new Map();

    const rows = await this.dataSource
      .getRepository(TripCoach)
      .createQueryBuilder('tripCoach')
      .innerJoin('tripCoach.datedTrip', 'trip')
      .innerJoin('tripCoach.coach', 'coach')
      .innerJoin('coach.classOfTrain', 'seatClass')
      .leftJoin('coach.coachLayout', 'layout')
      .leftJoin('layout.seats', 'seat')
      .select('trip.id', 'tripId')
      .addSelect('COUNT(seat.id)', 'availableSeats')
      .where('trip.id IN (:...tripIds)', { tripIds })
      .andWhere('trip.status = :status', {
        status: DatedTripStatus.PUBLISHED,
      })
      .andWhere('seatClass.id = :seatClassId', {
        seatClassId: query.seatClassId,
      })
      .groupBy('trip.id')
      .getRawMany<{ tripId: string; availableSeats: string }>();

    return new Map(
      rows.map((row) => {
        const availableSeats = Number(row.availableSeats);
        if (!Number.isSafeInteger(availableSeats) || availableSeats < 0) {
          throw new Error('Trip coach capacity query returned an invalid count');
        }
        return [row.tripId, availableSeats];
      }),
    );
  }
}
