import { Fare } from '../entities/fare.entity';

export const FARE_REPOSITORY = Symbol('FARE_REPOSITORY');

export interface FareRepository {
  save(fare: Fare): Promise<Fare>;
  findAll(): Promise<Fare[]>;
  findById(id: string): Promise<Fare | null>;
  findCurrent(
    trainId: string,
    trainClassId: string,
    originStationId: string,
    destinationStationId: string,
    at?: Date,
  ): Promise<Fare | null>;
}
