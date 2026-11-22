import { TimetableStop } from '../../domain/entities/timetable-stop.entity';
import { TimeTableStopOrmEntity } from '../entities/timetable-stop.typeorm.entity';

export class TimetableStopMapper {
  static toDomain(entity: TimeTableStopOrmEntity): TimetableStop {
    return new TimetableStop(
      entity.id,
      entity.arrivalTime,
      entity.departureTime,
      entity.stopOrder,
      { ...entity.timeTable },
      { ...entity.station },
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
