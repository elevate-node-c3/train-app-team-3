import { DatedTrip } from '../../domain/entities/dated-trip.entity';
import { DatedTrip as DatedTripOrmEntity } from '../entities/dated-trip.typeorm.entity';

export class DatedTripMapper {
  static toDomain(entity: DatedTripOrmEntity): DatedTrip {
    return new DatedTrip(
      entity.id,
      entity.serviceDate,
      entity.status,
      entity.timetableVersion,
      { ...entity.train },
      { ...entity.timetable },
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
