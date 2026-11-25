export interface TimetableReference {
  id: string;
  [key: string]: unknown;
}

export class Timetable {
  constructor(
    public readonly id: string,
    public departureTime: string,
    public effectiveFrom: Date,
    public effectiveTo: Date,
    public workingDays: string[],
    public status: boolean,
    public publishedAt: Date | null,
    public version: number,
    public train: TimetableReference,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
