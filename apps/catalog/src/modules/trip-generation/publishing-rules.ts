import { SeatInput, validateLayoutSeats } from '../coachLayout/layout-adjacency';

export const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const TIME = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export interface StopInput {
  stationId: string;
  arrivalTime: string | null;
  departureTime: string | null;
}

export interface FareRow {
  classId: string;
  originStationId: string;
  destinationStationId: string;
  price: number;
}

export function validateWorkingDays(days: string[]): string[] {
  if (!days.length) return ['A timetable must run on at least one day'];
  return days
    .filter((day) => !WEEKDAYS.includes(day.trim().toLowerCase()))
    .map((day) => `Unknown working day "${day}"`);
}

export function validateStops(stops: StopInput[]): string[] {
  const problems: string[] = [];

  if (stops.length < 2) return ['A timetable needs at least two stops'];

  const stations = new Set<string>();
  stops.forEach((stop, index) => {
    const first = index === 0;
    const last = index === stops.length - 1;
    const label = `Stop ${index + 1}`;

    if (stations.has(stop.stationId)) problems.push(`${label}: station appears twice`);
    stations.add(stop.stationId);

    if (first && stop.arrivalTime !== null) problems.push(`${label}: the first stop has no arrival`);
    if (last && stop.departureTime !== null) problems.push(`${label}: the last stop has no departure`);
    if (!first && stop.arrivalTime === null) problems.push(`${label}: arrival is required`);
    if (!last && stop.departureTime === null) problems.push(`${label}: departure is required`);

    for (const time of [stop.arrivalTime, stop.departureTime]) {
      if (time !== null && !TIME.test(time)) problems.push(`${label}: invalid time ${time}`);
    }
  });

  return problems;
}

/**
 * Every in-order pair of stops needs exactly one positive whole number of piastres for every class.
 * Rule (documented in the README): a sub-segment never costs MORE than a longer segment that
 * contains it. Checking the two one-stop extensions of each pair is enough (the rule is transitive).
 */
export function validateFareMatrix(
  stationIds: string[],
  classIds: string[],
  fares: FareRow[],
): string[] {
  const problems: string[] = [];
  const price = new Map<string, number>();
  for (const fare of fares) {
    price.set(`${fare.classId}|${fare.originStationId}|${fare.destinationStationId}`, fare.price);
  }
  const at = (classId: string, i: number, j: number) =>
    price.get(`${classId}|${stationIds[i]}|${stationIds[j]}`);

  for (const classId of classIds) {
    for (let i = 0; i < stationIds.length - 1; i++) {
      for (let j = i + 1; j < stationIds.length; j++) {
        const value = at(classId, i, j);
        if (value === undefined || !Number.isSafeInteger(value) || value <= 0) {
          problems.push(`Missing or invalid fare: class ${classId}, stop ${i + 1} -> stop ${j + 1}`);
          continue;
        }
        for (const [a, b] of [[i - 1, j], [i, j + 1]]) {
          if (a < 0 || b >= stationIds.length) continue;
          const outer = at(classId, a, b);
          if (outer !== undefined && value > outer) {
            problems.push(
              `Sub-segment costs more than its containing segment: class ${classId}, stop ${i + 1} -> ${j + 1} (${value}) vs stop ${a + 1} -> ${b + 1} (${outer})`,
            );
          }
        }
      }
    }
  }

  return problems;
}

export function validateCoaches(
  coaches: { coachNumber: number; hasClass: boolean; seats: SeatInput[] }[],
): string[] {
  if (!coaches.length) return ['The train has no coaches'];
  const problems: string[] = [];
  for (const coach of coaches) {
    if (!coach.hasClass) problems.push(`Coach ${coach.coachNumber} has no class or layout`);
    for (const problem of validateLayoutSeats(coach.seats)) {
      problems.push(`Coach ${coach.coachNumber}: ${problem}`);
    }
  }
  return problems;
}