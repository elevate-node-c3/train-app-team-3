import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainType } from '../../domain/entities/train-type.entity';
import { TrainTypeRepository } from '../../domain/repositories/train-type.repository';
import { TypeOfTrainOrmEntity } from '../entities/train-type.typeorm.entity';
import { TrainTypeMapper } from '../mapper/train-type.mapper';

@Injectable()
export class TypeOrmTrainTypeRepository implements TrainTypeRepository {
  constructor(
    @InjectRepository(TypeOfTrainOrmEntity)
    private readonly repository: Repository<TypeOfTrainOrmEntity>,
  ) {}

  async save(trainType: TrainType): Promise<TrainType> {
    const saved = await this.repository.save(
      TrainTypeMapper.toOrmEntity(trainType),
    );
    return TrainTypeMapper.toDomain(saved);
  }

  async findAll(): Promise<TrainType[]> {
    const trainTypes = await this.repository.find();
    return trainTypes.map(TrainTypeMapper.toDomain);
  }

  async findById(id: string): Promise<TrainType | null> {
    const trainType = await this.repository.findOneBy({ id });
    return trainType ? TrainTypeMapper.toDomain(trainType) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}