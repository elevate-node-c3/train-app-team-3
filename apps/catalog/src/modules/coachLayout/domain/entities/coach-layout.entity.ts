import { LayoutSeat } from './layout-seat.entity';

export interface CoachLayoutReference {
  id: string;
  [key: string]: unknown;
}

export class CoachLayout {
  constructor(
    public readonly id: string,
    public name_ar: string,
    public name_en: string,
    public description: string,
    public seats: LayoutSeat[],
    public coaches: CoachLayoutReference[],
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
