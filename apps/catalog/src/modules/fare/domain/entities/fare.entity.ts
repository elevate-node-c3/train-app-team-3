export interface FareReference {
  id: string;
  [key: string]: unknown;
}

export class Fare {
  constructor(
    public readonly id: string | null,
    public priceInPiasters: number,
    public effectiveFrom: Date,
    public train: FareReference,
    public trainClass: FareReference,
    public originStation: FareReference,
    public destinationStation: FareReference,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
