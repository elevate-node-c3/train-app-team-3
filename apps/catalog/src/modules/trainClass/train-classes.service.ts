import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateTrainClassDto } from './application/dtos/create-train-class.dto';
import { UpdateTrainClassDto } from './application/dtos/update-train-class.dto';
import { TrainClass } from './domain/entities/train-class.entity';
import {
  TRAIN_CLASS_REPOSITORY,
  TrainClassRepository,
} from './domain/repositories/train-class.repository';

@Injectable()
export class TrainClassesService {
  constructor(
    @Inject(TRAIN_CLASS_REPOSITORY)
    private readonly repository: TrainClassRepository,
  ) {}

  create(dto: CreateTrainClassDto) {
    const now = new Date();
    return this.repository.save(
      new TrainClass(randomUUID(), dto.name_ar, dto.name_en, now, now),
    );
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const trainClass = await this.repository.findById(id);

    if (!trainClass) {
      throw new NotFoundException('Train class not found');
    }

    return trainClass;
  }

  async update(id: string, dto: UpdateTrainClassDto) {
    const trainClass = await this.findOne(id);
    trainClass.name_ar = dto.name_ar ?? trainClass.name_ar;
    trainClass.name_en = dto.name_en ?? trainClass.name_en;
    trainClass.updatedAt = new Date();
    await this.repository.save(trainClass);
    return trainClass;
  }

  async remove(id: string) {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Train class not found');
    }

    return { message: 'Train class deleted successfully' };
  }
}