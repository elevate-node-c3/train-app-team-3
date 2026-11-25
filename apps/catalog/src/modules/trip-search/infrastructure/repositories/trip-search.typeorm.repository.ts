import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DatedTripStatus } from '../../../datedTrip/domain/entities/dated-trip.entity';
import { DatedTrip as DatedTripOrmEntity } from '../../../datedTrip/infrastructure/entities/dated-trip.typeorm.entity';
import { DatedTripStop } from '../../../dated-trip-stop/infrastructure/entities/dated-trip-stop.typeorm.entity';
import { Fare } from '../../../fare/infrastructure/entities/fare.typeorm.entity';
import { StationOrmEntity } from '../../../stations/infrastructure/entities/stations.typeorm.entity';
import { ClassesOfTrainsOrmEntity } from '../../../trainClass/infrastructure/entities/train-class.typeorm.entity';
import { TrainOrmEntity } from '../../../train/infrastructure/entities/train.typeorm.entity';
import { cairoDateOf } from '../../../trip-generation/domain/policies/cairo-time';
import {
  TripSearchCandidate,
  TripSearchClass,
  TripSearchQuery,
  TripSearchStation,
} from '../../domain/trip-search.model';
import {
  TripSearchRepository as TripSearchRepositoryPort,
} from '../../domain/trip-search.repository';

@Injectable()
export class TypeOrmTripSearchRepository implements TripSearchRepositoryPort {
  constructor(private readonly dataSource: DataSource) {}

  async findStation(id: string): Promise<TripSearchStation | null> {
    const station = await this.dataSource
      .getRepository(StationOrmEntity)
      .findOne({
        where: { id },
        select: { id: true, isActive: true },
      });

    return station ? { id: station.id, isActive: station.isActive } : null;
  }

  async findSeatClass(id: string): Promise<TripSearchClass | null> {
    const seatClass = await this.dataSource
      .getRepository(ClassesOfTrainsOrmEntity)
      .findOne({
        where: { id },
        select: { id: true, name_ar: true, name_en: true },
      });

    return seatClass
      ? {
          id: seatClass.id,
          nameAr: seatClass.name_ar,
          nameEn: seatClass.name_en,
        }
      : null;
  }

  async hasTrainNumber(number: number): Promise<boolean> {
    return (
      (await this.dataSource
        .getRepository(TrainOrmEntity)
        .count({ where: { number } })) > 0
    );
  }

  async hasRoute(
    originStationId: string,
    destinationStationId: string,
    trainNumber?: number,
  ): Promise<boolean> {
    const stopRepository = this.dataSource.getRepository(DatedTripStop);
    const originStopsQuery = stopRepository
      .createQueryBuilder('originStop')
      .innerJoinAndSelect('originStop.datedTrip', 'trip')
      .innerJoin('trip.train', 'train')
      .innerJoin('originStop.station', 'originStation')
      .where('originStation.id = :originStationId', { originStationId })
      .andWhere('originStop.departureAt IS NOT NULL')
      .andWhere('trip.status = :status', {
        status: DatedTripStatus.PUBLISHED,
      });

    if (trainNumber !== undefined) {
      originStopsQuery.andWhere('train.number = :trainNumber', {
        trainNumber,
      });
    }

    const originStops = await originStopsQuery.getMany();
    const tripIds = [...new Set(originStops.map((stop) => stop.datedTrip.id))];
    if (tripIds.length === 0) return false;

    const stops = await stopRepository
      .createQueryBuilder('tripStop')
      .innerJoinAndSelect('tripStop.datedTrip', 'trip')
      .innerJoinAndSelect('tripStop.station', 'station')
      .where('trip.id IN (:...tripIds)', { tripIds })
      .andWhere('trip.status = :status', {
        status: DatedTripStatus.PUBLISHED,
      })
      .orderBy('trip.id', 'ASC')
      .addOrderBy('tripStop.position', 'ASC')
      .getMany();

    const stopsByTrip = new Map<string, DatedTripStop[]>();
    for (const stop of stops) {
      const tripStops = stopsByTrip.get(stop.datedTrip.id) ?? [];
      tripStops.push(stop);
      stopsByTrip.set(stop.datedTrip.id, tripStops);
    }

    return [...stopsByTrip.values()].some((tripStops) =>
      tripStops.some(
        (origin, originIndex) =>
          origin.station.id === originStationId &&
          tripStops
            .slice(originIndex + 1)
            .some(
              (destination) =>
                destination.station.id === destinationStationId &&
                destination.arrivalAt !== null,
            ),
      ),
    );
  }

  async findCandidates(
    query: TripSearchQuery,
    faresEffectiveAt: Date,
  ): Promise<TripSearchCandidate[]> {
    const stopRepository = this.dataSource.getRepository(DatedTripStop);
    const originStopsQuery = stopRepository
      .createQueryBuilder('originStop')
      .innerJoinAndSelect('originStop.datedTrip', 'trip')
      .innerJoinAndSelect('trip.train', 'train')
      .innerJoinAndSelect('train.typeOfTrain', 'trainType')
      .innerJoinAndSelect('originStop.station', 'originStation')
      .where('originStop.departureDate = :departureDate', {
        departureDate: query.departureDate,
      })
      .andWhere('originStation.id = :originStationId', {
        originStationId: query.originStationId,
      })
      .andWhere('originStop.departureAt IS NOT NULL')
      .andWhere('trip.status = :status', {
        status: DatedTripStatus.PUBLISHED,
      });

    if (query.trainNumber !== undefined) {
      originStopsQuery.andWhere('train.number = :trainNumber', {
        trainNumber: query.trainNumber,
      });
    }
    const originStops = await originStopsQuery.getMany();

    const tripIds = [...new Set(originStops.map((stop) => stop.datedTrip.id))];
    if (tripIds.length === 0) return [];

    const stops = await stopRepository
      .createQueryBuilder('tripStop')
      .innerJoinAndSelect('tripStop.datedTrip', 'trip')
      .innerJoinAndSelect('trip.train', 'train')
      .innerJoinAndSelect('train.typeOfTrain', 'trainType')
      .innerJoinAndSelect('tripStop.station', 'station')
      .where('trip.id IN (:...tripIds)', { tripIds })
      .andWhere('trip.status = :status', {
        status: DatedTripStatus.PUBLISHED,
      })
      .orderBy('trip.id', 'ASC')
      .addOrderBy('tripStop.position', 'ASC')
      .getMany();

    const stopsByTrip = new Map<string, DatedTripStop[]>();
    for (const stop of stops) {
      const tripStops = stopsByTrip.get(stop.datedTrip.id) ?? [];
      tripStops.push(stop);
      stopsByTrip.set(stop.datedTrip.id, tripStops);
    }

    const trainIds = [
      ...new Set(
        [...stopsByTrip.values()].map(
          (tripStops) => tripStops[0].datedTrip.train.id,
        ),
      ),
    ];
    const fares = await this.dataSource
      .getRepository(Fare)
      .createQueryBuilder('fare')
      .innerJoinAndSelect('fare.train', 'fareTrain')
      .innerJoin('fare.trainClass', 'fareClass')
      .innerJoin('fare.originStation', 'fareOrigin')
      .innerJoin('fare.destinationStation', 'fareDestination')
      .where('fareTrain.id IN (:...trainIds)', { trainIds })
      .andWhere('fareClass.id = :seatClassId', {
        seatClassId: query.seatClassId,
      })
      .andWhere('fareOrigin.id = :originStationId', {
        originStationId: query.originStationId,
      })
      .andWhere('fareDestination.id = :destinationStationId', {
        destinationStationId: query.destinationStationId,
      })
      .andWhere('fare.effectiveFrom <= :faresEffectiveAt', {
        faresEffectiveAt,
      })
      .orderBy('fare.effectiveFrom', 'DESC')
      .getMany();

    const fareByTrain = new Map<string, Fare>();
    for (const fare of fares) {
      if (!fareByTrain.has(fare.train.id)) {
        fareByTrain.set(fare.train.id, fare);
      }
    }

    const candidates: TripSearchCandidate[] = [];
    for (const [tripId, tripStops] of stopsByTrip) {
      const originIndex = tripStops.findIndex(
        (stop) => stop.station.id === query.originStationId,
      );
      const destinationIndex = tripStops.findIndex(
        (stop) => stop.station.id === query.destinationStationId,
      );
      if (originIndex < 0 || destinationIndex <= originIndex) continue;

      const origin = tripStops[originIndex];
      const destination = tripStops[destinationIndex];
      if (!origin.departureAt || !destination.arrivalAt) continue;
      if (cairoDateOf(origin.departureAt.getTime()) !== query.departureDate) {
        continue;
      }

      const trip = origin.datedTrip as DatedTripOrmEntity;
      const train = trip.train;
      const fare = fareByTrain.get(train.id);
      if (!fare) continue;

      candidates.push({
        tripId,
        trainId: train.id,
        trainNumber: train.number,
        trainTypeId: train.typeOfTrain.id,
        trainTypeNameAr: train.typeOfTrain.name_ar,
        trainTypeNameEn: train.typeOfTrain.name_en,
        originStationId: origin.station.id,
        originStationNameAr: origin.station.name_ar,
        originStationNameEn: origin.station.name_en,
        destinationStationId: destination.station.id,
        destinationStationNameAr: destination.station.name_ar,
        destinationStationNameEn: destination.station.name_en,
        departureAt: origin.departureAt.toISOString(),
        arrivalAt: destination.arrivalAt.toISOString(),
        durationMinutes: Math.round(
          (destination.arrivalAt.getTime() - origin.departureAt.getTime()) /
            60_000,
        ),
        intermediateStopCount: destinationIndex - originIndex - 1,
        farePiastres: fare.priceInPiasters,
      });
    }

    return candidates;
  }
}
