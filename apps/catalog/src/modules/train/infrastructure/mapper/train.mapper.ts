import { TrainType } from '../../../trainType/domain/entities/train-type.entity';
import { TypeOfTrainOrmEntity } from '../../../trainType/infrastructure/entities/train-type.typeorm.entity';
import { Train } from '../../domain/entities/train.entity';
import { TrainOrmEntity } from '../entities/train.typeorm.entity';

export class TrainMapper {
  static toDomain(entity: TrainOrmEntity): Train {
    const typeOfTrain = entity.typeOfTrain;
    return new Train(
      entity.id,
      entity.number,
      new TrainType(
        typeOfTrain.id,
        typeOfTrain.name_ar,
        typeOfTrain.name_en,
        typeOfTrain.createdAt,
        typeOfTrain.updatedAt,
      ),
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toOrmEntity(train: Train): TrainOrmEntity {
    const entity = new TrainOrmEntity();
    entity.id = train.id;
    entity.number = train.number;
    entity.typeOfTrain = Object.assign(new TypeOfTrainOrmEntity(), {
      id: train.typeOfTrain.id,
    });
    entity.createdAt = train.createdAt;
    entity.updatedAt = train.updatedAt;
    return entity;
  }
}
