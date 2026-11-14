import { BadRequestException } from '@nestjs/common';
import { EntityManager, LessThanOrEqual } from 'typeorm';
import { Timetable } from '../timetable/timetable.entity';
import { TimeTableStop } from '../timetableStops/TimetableStop.entitiy';
import { Coach } from '../coach/coach.entity';
import { Fare } from '../fare/fare.entity';
import {
  FareRow,
  validateCoaches,
  validateFareMatrix,
  validateStops,
  validateWorkingDays,
} from './publishing-rules';

export interface PublishingInputs {
  stops: TimeTableStop[];
  coaches: Coach[];
  fares: FareRow[];
}

/** The fare in force at `at` for every (class, origin, destination) of a train. */
export async function loadCurrentFares(
  manager: EntityManager,
  trainId: string,
  at: Date = new Date(),
): Promise<FareRow[]> {
  const rows = await manager.find(Fare, {
    where: { train: { id: trainId }, effectiveFrom: LessThanOrEqual(at) },
    relations: { trainClass: true, originStation: true, destinationStation: true },
    order: { effectiveFrom: 'ASC' },
  });

  const current = new Map<string, FareRow>();
  for (const row of rows) {
    current.set(`${row.trainClass.id}|${row.originStation.id}|${row.destinationStation.id}`, {
      classId: row.trainClass.id,
      originStationId: row.originStation.id,
      destinationStationId: row.destinationStation.id,
      price: row.priceInPiasters,
    });
  }

  return [...current.values()];
}

/**
 * Loads everything a trip is built from and checks it. Used when a timetable is published and
 * again for every generated trip, so a missing fare is a publishing error, never a search-time surprise.
 */
export async function loadPublishingInputs(
  manager: EntityManager,
  timetable: Timetable,
): Promise<PublishingInputs> {
  const stops = await manager.find(TimeTableStop, {
    where: { timeTable: { id: timetable.id } },
    relations: { station: true },
    order: { stopOrder: 'ASC' },
  });

  const coaches = await manager.find(Coach, {
    where: { train: { id: timetable.train.id } },
    relations: { classOfTrain: true, coachLayout: { seats: true } },
    order: { coachNumber: 'ASC' },
  });

  const fares = await loadCurrentFares(manager, timetable.train.id);

  const problems = [
    ...validateWorkingDays(timetable.workingDays),
    ...validateStops(
      stops.map((stop) => ({
        stationId: stop.station?.id ?? '',
        arrivalTime: stop.arrivalTime,
        departureTime: stop.departureTime,
      })),
    ),
    ...validateCoaches(
      coaches.map((coach) => ({
        coachNumber: coach.coachNumber,
        hasClass: !!coach.classOfTrain && !!coach.coachLayout,
        seats: coach.coachLayout?.seats ?? [],
      })),
    ),
  ];

  if (!problems.length) {
    problems.push(
      ...validateFareMatrix(
        stops.map((stop) => stop.station.id),
        [...new Set(coaches.map((coach) => coach.classOfTrain.id))],
        fares,
      ),
    );
  }

  if (problems.length) {
    throw new BadRequestException(
      `Timetable ${timetable.id} cannot be published: ${problems.slice(0, 10).join('; ')}`,
    );
  }

  return { stops, coaches, fares };
}