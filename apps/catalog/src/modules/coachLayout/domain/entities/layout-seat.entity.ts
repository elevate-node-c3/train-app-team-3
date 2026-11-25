export enum SeatSide {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export class LayoutSeat {
  constructor(
    public readonly id: string | null,
    public seatNumber: string,
    public rowNumber: number,
    public position: number,
    public side: SeatSide,
    public adjacencyGroup: string,
  ) {}
}
