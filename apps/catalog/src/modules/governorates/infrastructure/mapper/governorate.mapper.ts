import { Governorate } from '../../domain/entities/governorate.entity';
import { GovernorateOrmEntity } from '../entities/governorates.typeorm.entity';

export class GovernorateMapper {
  static toDomain(entity: GovernorateOrmEntity): Governorate {
    return new Governorate(
      entity.id,
      entity.name_ar,
      entity.name_en,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toOrmEntity(governorate: Governorate): GovernorateOrmEntity {
    const entity = new GovernorateOrmEntity();
    entity.id = governorate.id;
    entity.name_ar = governorate.name_ar;
    entity.name_en = governorate.name_en;
    entity.createdAt = governorate.createdAt;
    entity.updatedAt = governorate.updatedAt;
    return entity;
  }
}
