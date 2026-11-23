import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassesOfTrains } from './train-class.entity';
import { CreateTrainClassDto } from './dto/create-train-class.dto';
import { UpdateTrainClassDto } from './dto/update-train-class.dto';

@Injectable()
export class TrainClassesRepository {
  constructor(
    @InjectRepository(ClassesOfTrains)
    private readonly repository: Repository<ClassesOfTrains>,
  ) {}

  create(dto: CreateTrainClassDto) {
    const trainClass = this.repository.create(dto);
    return this.repository.save(trainClass);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: string) {
    return this.repository.findOneBy({ id });
  }

  async update(id: string, dto: UpdateTrainClassDto) {
    const trainClass = await this.repository.findOneBy({ id });

    if (!trainClass) return null;

    Object.assign(trainClass, dto);

    return this.repository.save(trainClass);
  }

  async remove(id: string) {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}