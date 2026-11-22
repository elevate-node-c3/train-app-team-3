import { TrainType } from '../entities/train-type.entity';

export interface TrainTypeRepository {
  save(trainType: TrainType): Promise<TrainType>;
  findAll(): Promise<TrainType[]>;
  findById(id: string): Promise<TrainType | null>;
  delete(id: string): Promise<boolean>;
}

export const TRAIN_TYPE_REPOSITORY = Symbol('TRAIN_TYPE_REPOSITORY');
