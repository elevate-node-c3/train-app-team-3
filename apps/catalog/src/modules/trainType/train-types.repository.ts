import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOfTrain } from './train-type.entity';
import { CreateTrainTypeDto } from './dto/create-train-type.dto';
import { UpdateTrainTypeDto } from './dto/update-train-type.dto';

@Injectable()
export class TrainTypesRepository {
  constructor(
    @InjectRepository(TypeOfTrain)
    private readonly repository: Repository<TypeOfTrain>,
  ) {}

  create(dto: CreateTrainTypeDto) {
    const trainType = this.repository.create(dto);
    return this.repository.save(trainType);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: string) {
    return this.repository.findOneBy({ id });
  }

  async update(id: string, dto: UpdateTrainTypeDto) {
    const trainType = await this.repository.findOneBy({ id });

    if (!trainType) return null;

    Object.assign(trainType, dto);

    return this.repository.save(trainType);
  }

  async remove(id: string) {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}