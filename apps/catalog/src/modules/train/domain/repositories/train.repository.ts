import { Train } from '../entities/train.entity';

export interface TrainRepository {
  create(train: Train): Promise<Train | null>;
  findAll(): Promise<Train[]>;
  findOne(id: string): Promise<Train | null>;
  update(id: string, train: Train): Promise<Train | null>;
  remove(id: string): Promise<boolean>;
}

export const TRAIN_REPOSITORY = Symbol('TRAIN_REPOSITORY');
