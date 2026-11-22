import { Station } from '../../domain/entities/station.entity';
import { StationOrmEntity } from '../entities/stations.typeorm.entity';
import { CityMapper } from '../../../cities/infrastructure/mapper/city.mapper';
import { CityOrmEntity } from '../../../cities/infrastructure/entities/city.typeorm.entity';

export class StationMapper {
  static toDomain(entity: StationOrmEntity): Station {
    return new Station(
      entity.id,
      entity.name_ar,
      entity.name_en,
      entity.address,
      entity.isActive,
      entity.cityId,
      entity.alternativeNames ?? [],
      entity.createdAt,
      entity.updatedAt,
      CityMapper.toDomain(entity.city),
    );
  }

  static toOrmEntity(station: Station): StationOrmEntity {
    const entity = new StationOrmEntity();
    entity.id = station.id;
    entity.name_ar = station.name_ar;
    entity.name_en = station.name_en;
    entity.address = station.address;
    entity.isActive = station.isActive;
    entity.cityId = station.cityId;
    entity.city = Object.assign(new CityOrmEntity(), { id: station.cityId });
    entity.alternativeNames = station.alternativeNames;
    entity.createdAt = station.createdAt;
    entity.updatedAt = station.updatedAt;
    return entity;
  }
}
