import { Injectable, NotFoundException } from '@nestjs/common';
import { TrainClassesRepository } from './train-classes.repository';
import { CreateTrainClassDto } from './dto/create-train-class.dto';
import { UpdateTrainClassDto } from './dto/update-train-class.dto';

@Injectable()
export class TrainClassesService {
  constructor(private readonly repository: TrainClassesRepository) {}

  create(dto: CreateTrainClassDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const trainClass = await this.repository.findOne(id);

    if (!trainClass) {
      throw new NotFoundException('Train class not found');
    }

    return trainClass;
  }

  async update(id: string, dto: UpdateTrainClassDto) {
    const trainClass = await this.repository.update(id, dto);

    if (!trainClass) {
      throw new NotFoundException('Train class not found');
    }

    return trainClass;
  }

  async remove(id: string) {
    const deleted = await this.repository.remove(id);

    if (!deleted) {
      throw new NotFoundException('Train class not found');
    }

    return { message: 'Train class deleted successfully' };
  }
}