import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Train } from './train.entity';
import { TypeOfTrain } from '../trainType/train-type.entity';
import { CreateTrainDto } from './dto/create-train.dto';
import { UpdateTrainDto } from './dto/update-train.dto';

@Injectable()
export class TrainsRepository {
  constructor(
    @InjectRepository(Train)
    private readonly repository: Repository<Train>,
    @InjectRepository(TypeOfTrain)
    private readonly typeOfTrainRepository: Repository<TypeOfTrain>,
  ) {}

  async create(dto: CreateTrainDto) {
    const typeOfTrain = await this.typeOfTrainRepository.findOneBy({
      id: dto.typeOfTrainId,
    });

    if (!typeOfTrain) return null;

    const train = this.repository.create({
      number: dto.number,
      typeOfTrain,
    });

    return this.repository.save(train);
  }

  findAll() {
    return this.repository.find({
      relations: { typeOfTrain: true },
    });
  }

  findOne(id: string) {
    return this.repository.findOne({
      where: { id },
      relations: { typeOfTrain: true },
    });
  }

  async update(id: string, dto: UpdateTrainDto) {
    const train = await this.repository.findOneBy({ id });

    if (!train) return null;

    if (dto.number !== undefined) {
      train.number = dto.number;
    }

    if (dto.typeOfTrainId !== undefined) {
      const typeOfTrain = await this.typeOfTrainRepository.findOneBy({
        id: dto.typeOfTrainId,
      });

      if (!typeOfTrain) return null;

      train.typeOfTrain = typeOfTrain;
    }

    return this.repository.save(train);
  }

  async remove(id: string) {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}