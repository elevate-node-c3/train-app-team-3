import { PassengerType } from "../../application/enums/passenger-type.enum";

export class Passenger {
  constructor(
    public readonly id: string,
    public fullName: string,
    public nationalId: string,
    public passengerType: PassengerType,
    public readonly userId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
