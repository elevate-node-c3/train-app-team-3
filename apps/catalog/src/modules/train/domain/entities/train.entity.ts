import { TrainType } from '../../../trainType/domain/entities/train-type.entity';

export class Train {
  constructor(
    public readonly id: string,
    public number: number,
    public typeOfTrain: TrainType,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
