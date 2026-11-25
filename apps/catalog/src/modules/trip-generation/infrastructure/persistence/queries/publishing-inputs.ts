import { EntityManager, LessThanOrEqual } from 'typeorm';
import { TimeTableStopOrmEntity } from '../../../../timetableStops/infrastructure/entities/timetable-stop.typeorm.entity';
import { CoachOrmEntity } from '../../../../coach/infrastructure/entities/coach.typeorm.entity';
import { Fare } from '../../../../fare/infrastructure/entities/fare.typeorm.entity';
import { FareRow } from '../../../domain/policies/publishing-rules';

export interface PublishingInputs {
  stops: TimeTableStopOrmEntity[];
  coaches: CoachOrmEntity[];
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
 * Loads the current timetable inputs. Validation remains in the application/domain policy layer.
 */
export async function loadPublishingInputs(
  manager: EntityManager,
  timetable: { id: string; train: { id: string } },
): Promise<PublishingInputs> {
  const stops = await manager.find(TimeTableStopOrmEntity, {
    where: { timeTable: { id: timetable.id } },
    relations: { station: true },
    order: { stopOrder: 'ASC' },
  });

  const coaches = await manager.find(CoachOrmEntity, {
    where: { train: { id: timetable.train.id } },
    relations: { classOfTrain: true, coachLayout: { seats: true } },
    order: { coachNumber: 'ASC' },
  });

  const fares = await loadCurrentFares(manager, timetable.train.id);

  return { stops, coaches, fares };
}