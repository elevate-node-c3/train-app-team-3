import { Timetable } from '../../domain/entities/timetable.entity';
import { TimetableOrmEntity } from '../entities/timetable.typeorm.entity';

export class TimetableMapper {
  static toDomain(entity: TimetableOrmEntity): Timetable {
    return new Timetable(
      entity.id,
      entity.departureTime,
      entity.effectiveFrom,
      entity.effectiveTo,
      [...entity.workingDays],
      entity.status,
      entity.publishedAt,
      entity.version,
      { ...entity.train },
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
