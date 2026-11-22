export interface CoachRelation {
  id: string;
  [key: string]: unknown;
}

export class Coach {
  constructor(
    public readonly id: string,
    public coachNumber: number,
    public train: CoachRelation,
    public classOfTrain: CoachRelation,
    public coachLayout: CoachRelation,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
