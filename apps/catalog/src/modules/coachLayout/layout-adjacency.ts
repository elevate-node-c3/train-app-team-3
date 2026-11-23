export interface SeatInput {
  seatNumber: string;
  rowNumber: number;
  position: number;
  side: string;
}

/** Seats of one row on one side of the aisle share a group: side by side, no aisle between. */
export function adjacencyGroupOf(seat: Pick<SeatInput, 'rowNumber' | 'side'>): string {
  return `R${seat.rowNumber}-${seat.side}`;
}

/** Returns the problems found; an empty array means the layout is valid. */
export function validateLayoutSeats(seats: SeatInput[]): string[] {
  const problems: string[] = [];

  if (!seats.length) return ['A layout needs at least one seat'];

  const numbers = new Set<string>();
  for (const seat of seats) {
    if (numbers.has(seat.seatNumber)) problems.push(`Duplicate seat number ${seat.seatNumber}`);
    numbers.add(seat.seatNumber);
  }

  const groups = new Map<string, number[]>();
  for (const seat of seats) {
    const key = adjacencyGroupOf(seat);
    groups.set(key, [...(groups.get(key) ?? []), seat.position]);
  }

  for (const [group, positions] of groups) {
    const sorted = [...positions].sort((a, b) => a - b);
    if (sorted.some((position, index) => position !== index + 1)) {
      problems.push(`Seats of ${group} must have positions 1..${sorted.length} with no gaps`);
    }
  }

  return problems;
}