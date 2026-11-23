import { Injectable, NotFoundException } from '@nestjs/common';
import { TrainTypesRepository } from './train-types.repository';
import { CreateTrainTypeDto } from './dto/create-train-type.dto';
import { UpdateTrainTypeDto } from './dto/update-train-type.dto';

@Injectable()
export class TrainTypesService {
  constructor(private readonly repository: TrainTypesRepository) {}

  create(dto: CreateTrainTypeDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const trainType = await this.repository.findOne(id);

    if (!trainType) {
      throw new NotFoundException('Train type not found');
    }

    return trainType;
  }

  async update(id: string, dto: UpdateTrainTypeDto) {
    const trainType = await this.repository.update(id, dto);

    if (!trainType) {
      throw new NotFoundException('Train type not found');
    }

    return trainType;
  }

  async remove(id: string) {
    const deleted = await this.repository.remove(id);

    if (!deleted) {
      throw new NotFoundException('Train type not found');
    }

    return { message: 'Train type deleted successfully' };
  }
}