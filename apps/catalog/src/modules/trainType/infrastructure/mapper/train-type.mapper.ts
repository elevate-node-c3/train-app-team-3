import { TrainType } from '../../domain/entities/train-type.entity';
import { TypeOfTrainOrmEntity } from '../entities/train-type.typeorm.entity';

export class TrainTypeMapper {
  static toDomain(entity: TypeOfTrainOrmEntity): TrainType {
    return new TrainType(
      entity.id,
      entity.name_ar,
      entity.name_en,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toOrmEntity(trainType: TrainType): TypeOfTrainOrmEntity {
    const entity = new TypeOfTrainOrmEntity();
    entity.id = trainType.id;
    entity.name_ar = trainType.name_ar;
    entity.name_en = trainType.name_en;
    entity.createdAt = trainType.createdAt;
    entity.updatedAt = trainType.updatedAt;
    return entity;
  }
}
