import { TrainClass } from '../../domain/entities/train-class.entity';
import { ClassesOfTrainsOrmEntity } from '../entities/train-class.typeorm.entity';

export class TrainClassMapper {
  static toDomain(entity: ClassesOfTrainsOrmEntity): TrainClass {
    return new TrainClass(
      entity.id,
      entity.name_ar,
      entity.name_en,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toOrmEntity(trainClass: TrainClass): ClassesOfTrainsOrmEntity {
    const entity = new ClassesOfTrainsOrmEntity();
    entity.id = trainClass.id;
    entity.name_ar = trainClass.name_ar;
    entity.name_en = trainClass.name_en;
    entity.createdAt = trainClass.createdAt;
    entity.updatedAt = trainClass.updatedAt;
    return entity;
  }
}
