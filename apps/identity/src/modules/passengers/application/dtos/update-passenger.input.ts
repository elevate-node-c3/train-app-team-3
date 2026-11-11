import { PassengerType } from "../enums/passenger-type.enum";

export interface UpdatePassengerInput {
  fullName: string;
  nationalId: string;
  passengerType: PassengerType;
}
