import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateTrainTypeDto } from './application/dtos/create-train-type.dto';
import { UpdateTrainTypeDto } from './application/dtos/update-train-type.dto';
import { TrainType } from './domain/entities/train-type.entity';
import {
  TRAIN_TYPE_REPOSITORY,
  TrainTypeRepository,
} from './domain/repositories/train-type.repository';

@Injectable()
export class TrainTypesService {
  constructor(
    @Inject(TRAIN_TYPE_REPOSITORY)
    private readonly repository: TrainTypeRepository,
  ) {}

  create(dto: CreateTrainTypeDto) {
    const now = new Date();
    return this.repository.save(
      new TrainType(randomUUID(), dto.name_ar, dto.name_en, now, now),
    );
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const trainType = await this.repository.findById(id);

    if (!trainType) {
      throw new NotFoundException('Train type not found');
    }

    return trainType;
  }

  async update(id: string, dto: UpdateTrainTypeDto) {
    const trainType = await this.findOne(id);
    trainType.name_ar = dto.name_ar ?? trainType.name_ar;
    trainType.name_en = dto.name_en ?? trainType.name_en;
    trainType.updatedAt = new Date();
    await this.repository.save(trainType);
    return trainType;
  }

  async remove(id: string) {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Train type not found');
    }

    return { message: 'Train type deleted successfully' };
  }
}