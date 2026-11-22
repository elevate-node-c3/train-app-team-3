import { CoachLayout } from '../../domain/entities/coach-layout.entity';
import { LayoutSeat as LayoutSeatModel } from '../../domain/entities/layout-seat.entity';
import { CoachLayout as CoachLayoutOrmEntity } from '../entities/coach-layout.typeorm.entity';
import { LayoutSeat as LayoutSeatOrmEntity } from '../entities/layout-seat.typeorm.entity';

export class CoachLayoutMapper {
  static toDomain(entity: CoachLayoutOrmEntity): CoachLayout {
    return new CoachLayout(
      entity.id,
      entity.name_ar,
      entity.name_en,
      entity.description,
      (entity.seats ?? []).map(CoachLayoutMapper.seatToDomain),
      (entity.coaches ?? []).map((coach) => ({ ...coach })),
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static seatToDomain(entity: LayoutSeatOrmEntity): LayoutSeatModel {
    return new LayoutSeatModel(
      entity.id,
      entity.seatNumber,
      entity.rowNumber,
      entity.position,
      entity.side,
      entity.adjacencyGroup,
    );
  }

  static toOrmEntity(layout: CoachLayout): CoachLayoutOrmEntity {
    const entity = new CoachLayoutOrmEntity();
    entity.id = layout.id;
    entity.name_ar = layout.name_ar;
    entity.name_en = layout.name_en;
    entity.description = layout.description;
    return entity;
  }
}
