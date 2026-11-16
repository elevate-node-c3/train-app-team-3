import { PassengerType } from "../enums/passenger-type.enum";

export interface CreatePassengerInput {
  fullName: string;
  nationalId: string;
  passengerType: PassengerType;
  userId: string;
}
