import { Injectable, NotFoundException } from '@nestjs/common';
import { TrainsRepository } from './trains.repository';
import { CreateTrainDto } from './dto/create-train.dto';
import { UpdateTrainDto } from './dto/update-train.dto';

@Injectable()
export class TrainsService {
  constructor(private readonly trainsRepository: TrainsRepository) {}

  async create(dto: CreateTrainDto) {
    const train = await this.trainsRepository.create(dto);

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
    const train = await this.trainsRepository.update(id, dto);

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