import { Passenger } from "../entities/passenger.entity";

export interface PassengerRepository {
  save(passenger: Passenger): Promise<Passenger>;
  saveIfBelowLimit(
    passenger: Passenger,
    maxPassengers: number,
  ): Promise<
    | { created: true; passenger: Passenger }
    | { created: false; reason: "limit_reached" | "user_not_found" }
  >;
  findByUserId(userId: string): Promise<Passenger[]>;
  findByIdForUser(id: string, userId: string): Promise<Passenger | null>;
  findByNationalIdForUser(
    nationalId: string,
    userId: string,
  ): Promise<Passenger | null>;
  deleteByIdForUser(id: string, userId: string): Promise<boolean>;
}

export const PASSENGER_REPOSITORY = Symbol("PASSENGER_REPOSITORY");
