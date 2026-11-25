export enum DatedTripStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
}

export interface DatedTripReference {
  id: string;
  [key: string]: unknown;
}

export class DatedTrip {
  constructor(
    public readonly id: string,
    public serviceDate: string,
    public status: DatedTripStatus,
    public timetableVersion: number,
    public train: DatedTripReference,
    public timetable: DatedTripReference,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
