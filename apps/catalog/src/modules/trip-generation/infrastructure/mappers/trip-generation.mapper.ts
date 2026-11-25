import { randomUUID } from 'crypto';
import { TripPublishedEvent } from '../../../../events/catalog.events';
import { GenerationInputs, GenerationTimetable } from '../../domain/entities/trip-generation.model';
import { CreateGeneratedTrip } from '../../domain/entities/trip-generation.model';
import { FareRow } from '../../domain/policies/publishing-rules';
import { TimetableOrmEntity } from '../../../timetable/infrastructure/entities/timetable.typeorm.entity';
import { TimeTableStopOrmEntity } from '../../../timetableStops/infrastructure/entities/timetable-stop.typeorm.entity';
import { CoachOrmEntity } from '../../../coach/infrastructure/entities/coach.typeorm.entity';

export class TripGenerationMapper {
  static toTimetable(entity: TimetableOrmEntity): GenerationTimetable {
    const type = entity.train.typeOfTrain;
    return {
      id: entity.id,
      status: entity.status,
      publishedAt: entity.publishedAt,
      effectiveFrom: entity.effectiveFrom,
      effectiveTo: entity.effectiveTo,
      workingDays: entity.workingDays,
      version: entity.version,
      train: {
        id: entity.train.id,
        number: entity.train.number,
        type: { id: type.id, nameAr: type.name_ar, nameEn: type.name_en },
      },
    };
  }

  static toInputs(
    stops: TimeTableStopOrmEntity[],
    coaches: CoachOrmEntity[],
    fares: FareRow[],
  ): GenerationInputs {
    return {
      stops: stops.map((stop) => ({
        stationId: stop.station?.id ?? '',
        arrivalTime: stop.arrivalTime,
        departureTime: stop.departureTime,
      })),
      coaches: coaches.map((coach) => ({
        id: coach.id,
        coachNumber: coach.coachNumber,
        classOfTrain: coach.classOfTrain
          ? {
              id: coach.classOfTrain.id,
              nameAr: coach.classOfTrain.name_ar,
              nameEn: coach.classOfTrain.name_en,
            }
          : null,
        coachLayout: coach.coachLayout
          ? {
              id: coach.coachLayout.id,
              seats: coach.coachLayout.seats.map((seat) => ({
                seatNumber: seat.seatNumber,
                rowNumber: seat.rowNumber,
                position: seat.position,
                side: seat.side,
                adjacencyGroup: seat.adjacencyGroup,
              })),
            }
          : null,
      })),
      fares,
    };
  }

  static toPublishedEvent(command: CreateGeneratedTrip, tripId: string): TripPublishedEvent {
    const type = command.timetable.train.type;
    return {
      version: 1,
      eventId: randomUUID(),
      eventType: 'trip-published',
      occurredAt: new Date().toISOString(),
      tripId,
      trainId: command.timetable.train.id,
      trainNumber: command.timetable.train.number,
      trainType: { id: type.id, nameAr: type.nameAr, nameEn: type.nameEn },
      timetableId: command.timetable.id,
      timetableVersion: command.timetable.version,
      serviceDate: command.serviceDate,
      stops: command.stops.map((stop) => ({
        stationId: stop.stationId,
        position: stop.position,
        arrivalTime: stop.arrivalTime,
        departureTime: stop.departureTime,
        arrivalAt: stop.arrivalMs === null ? null : new Date(stop.arrivalMs).toISOString(),
        departureAt: stop.departureMs === null ? null : new Date(stop.departureMs).toISOString(),
        arrivalDate: stop.arrivalDate,
        departureDate: stop.departureDate,
      })),
      coaches: command.coaches.map((coach) => ({
        coachId: coach.id,
        coachNumber: coach.coachNumber,
        class: {
          id: coach.classOfTrain!.id,
          nameAr: coach.classOfTrain!.nameAr,
          nameEn: coach.classOfTrain!.nameEn,
        },
        layoutId: coach.coachLayout!.id,
        seats: [...coach.coachLayout!.seats]
          .sort(
            (a, b) =>
              a.rowNumber - b.rowNumber ||
              (a.side === b.side ? 0 : a.side === 'LEFT' ? -1 : 1) ||
              a.position - b.position,
          )
          .map((seat) => ({
            seatNumber: seat.seatNumber,
            rowNumber: seat.rowNumber,
            position: seat.position,
            side: seat.side,
            adjacencyGroup: seat.adjacencyGroup,
          })),
      })),
    };
  }
}
