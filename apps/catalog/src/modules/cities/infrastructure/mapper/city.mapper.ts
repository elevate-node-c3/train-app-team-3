import { City } from '../../domain/entities/city.entity';
import { CityOrmEntity } from '../entities/city.typeorm.entity';
import { GovernorateMapper } from '../../../governorates/infrastructure/mapper/governorate.mapper';
import { GovernorateOrmEntity } from '../../../governorates/infrastructure/entities/governorates.typeorm.entity';

export class CityMapper {
  static toDomain(entity: CityOrmEntity): City {
    return new City(
      entity.id,
      entity.name_ar,
      entity.name_en,
      entity.governorateId,
      entity.createdAt,
      entity.updatedAt,
      GovernorateMapper.toDomain(entity.governorate),
    );
  }

  static toOrmEntity(city: City): CityOrmEntity {
    const entity = new CityOrmEntity();
    entity.id = city.id;
    entity.name_ar = city.name_ar;
    entity.name_en = city.name_en;
    entity.governorateId = city.governorateId;
    entity.governorate = Object.assign(new GovernorateOrmEntity(), {
      id: city.governorateId,
    });
    entity.createdAt = city.createdAt;
    entity.updatedAt = city.updatedAt;
    return entity;
  }
}
