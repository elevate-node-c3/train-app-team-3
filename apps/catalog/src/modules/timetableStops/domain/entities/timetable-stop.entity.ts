export interface TimetableStopReference {
  id: string;
  [key: string]: unknown;
}

export class TimetableStop {
  constructor(
    public readonly id: string,
    public arrivalTime: string | null,
    public departureTime: string | null,
    public stopOrder: number,
    public timeTable: TimetableStopReference,
    public station: TimetableStopReference,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
