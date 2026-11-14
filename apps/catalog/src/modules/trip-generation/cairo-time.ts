export const CAIRO_ZONE = 'Africa/Cairo';

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: CAIRO_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const DAY_MS = 86_400_000;

function partsAt(utcMs: number) {
  const parts: Record<string, number> = {};
  for (const p of formatter.formatToParts(new Date(utcMs))) {
    if (p.type !== 'literal') parts[p.type] = Number(p.value);
  }
  return parts;
}

/** Cairo's UTC offset in minutes at an instant (120 in winter, 180 in summer). */
export function cairoOffsetMinutes(utcMs: number): number {
  const p = partsAt(utcMs);
  const localAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute, p.second);
  return Math.round((localAsUtc - Math.floor(utcMs / 1000) * 1000) / 60_000);
}

/** The Cairo calendar date (YYYY-MM-DD) of an instant. */
export function cairoDateOf(utcMs: number): string {
  const p = partsAt(utcMs);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function weekdayOf(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const names = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return names[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

export interface CairoResolution {
  /** Ascending. One instant normally, two on the fall-back night, one (shifted) in the spring gap. */
  instants: number[];
  /** True when the wall-clock time does not exist (spring-forward gap). */
  nonexistent: boolean;
}

/**
 * Turns a Cairo wall-clock date and time into instants through the IANA zone (never a fixed offset).
 *  - Nonexistent time (spring forward): moved forward by the length of the gap
 *    (00:30 on the night clocks jump becomes 01:30 summer time).
 *  - Ambiguous time (fall back): both instants are returned; callers pick the first.
 */
export function resolveCairoWallClock(date: string, time: string): CairoResolution {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm, ss = 0] = time.split(':').map(Number);
  const localAsUtc = Date.UTC(y, m - 1, d, hh, mm, ss);

  const before = cairoOffsetMinutes(localAsUtc - DAY_MS);
  const after = cairoOffsetMinutes(localAsUtc + DAY_MS);

  const instants = [...new Set([before, after])]
    .map((offset) => ({ offset, utc: localAsUtc - offset * 60_000 }))
    .filter(({ offset, utc }) => cairoOffsetMinutes(utc) === offset)
    .map(({ utc }) => utc)
    .sort((a, b) => a - b);

  if (instants.length === 0) {
    return { instants: [localAsUtc - before * 60_000], nonexistent: true };
  }

  return { instants, nonexistent: false };
}

/**
 * Resolves a timetable time of a trip that starts on `serviceDate`.
 * The stop falls on the first day (serviceDate, +1, +2) whose instant is not before `notBefore`
 * (the previous stop), which is what makes overnight trips work. Ambiguous times take the
 * first occurrence unless that would run backwards in time.
 */
export function resolveStopInstant(
  serviceDate: string,
  time: string,
  notBefore: number | null,
): number {
  for (let offset = 0; offset <= 2; offset++) {
    const { instants } = resolveCairoWallClock(addDays(serviceDate, offset), time);
    const found = notBefore === null ? instants[0] : instants.find((i) => i >= notBefore);
    if (found !== undefined) return found;
  }
  throw new Error(`Cannot place ${time} after the previous stop for service date ${serviceDate}`);
}