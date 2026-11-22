import { TrainClass } from '../entities/train-class.entity';

export interface TrainClassRepository {
  save(trainClass: TrainClass): Promise<TrainClass>;
  findAll(): Promise<TrainClass[]>;
  findById(id: string): Promise<TrainClass | null>;
  delete(id: string): Promise<boolean>;
}

export const TRAIN_CLASS_REPOSITORY = Symbol('TRAIN_CLASS_REPOSITORY');
