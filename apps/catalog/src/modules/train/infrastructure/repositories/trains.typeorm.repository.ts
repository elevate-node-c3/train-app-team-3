import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainOrmEntity } from '../entities/train.typeorm.entity';
import { TypeOfTrainOrmEntity } from '../../../trainType/infrastructure/entities/train-type.typeorm.entity';
import { Train } from '../../domain/entities/train.entity';
import { TrainRepository } from '../../domain/repositories/train.repository';
import { TrainMapper } from '../mapper/train.mapper';

@Injectable()
export class TypeOrmTrainsRepository implements TrainRepository {
  constructor(
    @InjectRepository(TrainOrmEntity)
    private readonly repository: Repository<TrainOrmEntity>,
    @InjectRepository(TypeOfTrainOrmEntity)
    private readonly typeOfTrainRepository: Repository<TypeOfTrainOrmEntity>,
  ) {}

  async create(train: Train): Promise<Train | null> {
    const typeOfTrain = await this.typeOfTrainRepository.findOneBy({
      id: train.typeOfTrain.id,
    });

    if (!typeOfTrain) return null;

    const entity = this.repository.create({
      id: train.id,
      number: train.number,
      typeOfTrain,
    });

    const saved = await this.repository.save(entity);
    return this.findOne(saved.id);
  }

  async findAll(): Promise<Train[]> {
    const trains = await this.repository.find({
      relations: { typeOfTrain: true },
    });
    return trains.map(TrainMapper.toDomain);
  }

  async findOne(id: string): Promise<Train | null> {
    const train = await this.repository.findOne({
      where: { id },
      relations: { typeOfTrain: true },
    });
    return train ? TrainMapper.toDomain(train) : null;
  }

  async update(id: string, train: Train): Promise<Train | null> {
    const existing = await this.repository.findOneBy({ id });

    if (!existing) return null;

    const typeOfTrain = await this.typeOfTrainRepository.findOneBy({
      id: train.typeOfTrain.id,
    });
    if (!typeOfTrain) return null;

    existing.number = train.number;
    existing.typeOfTrain = typeOfTrain;
    await this.repository.save(existing);
    return this.findOne(id);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}