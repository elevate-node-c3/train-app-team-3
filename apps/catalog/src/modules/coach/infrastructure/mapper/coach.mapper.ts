import { ClassesOfTrainsOrmEntity } from '../../../trainClass/infrastructure/entities/train-class.typeorm.entity';
import { Coach } from '../../domain/entities/coach.entity';
import { CoachOrmEntity } from '../entities/coach.typeorm.entity';
import { TrainOrmEntity } from '../../../train/infrastructure/entities/train.typeorm.entity';
import { CoachLayout } from '../../../coachLayout/infrastructure/entities/coach-layout.typeorm.entity';

export class CoachMapper {
  static toDomain(entity: CoachOrmEntity): Coach {
    return new Coach(
      entity.id,
      entity.coachNumber,
      { ...entity.train },
      { ...entity.classOfTrain },
      { ...entity.coachLayout },
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toOrmEntity(coach: Coach): CoachOrmEntity {
    const entity = new CoachOrmEntity();
    entity.id = coach.id;
    entity.coachNumber = coach.coachNumber;
    entity.train = Object.assign(new TrainOrmEntity(), {
      id: coach.train.id,
    });
    entity.classOfTrain = Object.assign(new ClassesOfTrainsOrmEntity(), {
      id: coach.classOfTrain.id,
    });
    entity.coachLayout = Object.assign(new CoachLayout(), {
      id: coach.coachLayout.id,
    });
    entity.createdAt = coach.createdAt;
    entity.updatedAt = coach.updatedAt;
    return entity;
  }
}
