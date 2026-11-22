import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateTrainDto } from './application/dtos/create-train.dto';
import { UpdateTrainDto } from './application/dtos/update-train.dto';
import { Train } from './domain/entities/train.entity';
import {
  TRAIN_REPOSITORY,
  TrainRepository,
} from './domain/repositories/train.repository';
import { TrainType } from '../trainType/domain/entities/train-type.entity';

@Injectable()
export class TrainsService {
  constructor(
    @Inject(TRAIN_REPOSITORY)
    private readonly trainsRepository: TrainRepository,
  ) {}

  async create(dto: CreateTrainDto) {
    const now = new Date();
    const train = await this.trainsRepository.create(
      new Train(
        randomUUID(),
        dto.number,
        new TrainType(dto.typeOfTrainId, '', '', now, now),
        now,
        now,
      ),
    );

    if (!train) {
      throw new NotFoundException('Train type not found');
    }

    return train;
  }

  findAll() {
    return this.trainsRepository.findAll();
  }

  async findOne(id: string) {
    const train = await this.trainsRepository.findOne(id);

    if (!train) {
      throw new NotFoundException('Train not found');
    }

    return train;
  }

  async update(id: string, dto: UpdateTrainDto) {
    const existing = await this.trainsRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException('Train or train type not found');
    }

    const now = new Date();
    const train = await this.trainsRepository.update(
      id,
      new Train(
        existing.id,
        dto.number ?? existing.number,
        dto.typeOfTrainId !== undefined
          ? new TrainType(dto.typeOfTrainId, '', '', now, now)
          : existing.typeOfTrain,
        existing.createdAt,
        now,
      ),
    );

    if (!train) {
      throw new NotFoundException('Train or train type not found');
    }

    return train;
  }

  async remove(id: string) {
    const deleted = await this.trainsRepository.remove(id);

    if (!deleted) {
      throw new NotFoundException('Train not found');
    }

    return { message: 'Train deleted successfully' };
  }
}