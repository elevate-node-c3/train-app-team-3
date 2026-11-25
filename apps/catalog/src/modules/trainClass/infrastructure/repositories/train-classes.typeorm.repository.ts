import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainClass } from '../../domain/entities/train-class.entity';
import { TrainClassRepository } from '../../domain/repositories/train-class.repository';
import { ClassesOfTrainsOrmEntity } from '../entities/train-class.typeorm.entity';
import { TrainClassMapper } from '../mapper/train-class.mapper';

@Injectable()
export class TypeOrmTrainClassRepository implements TrainClassRepository {
  constructor(
    @InjectRepository(ClassesOfTrainsOrmEntity)
    private readonly repository: Repository<ClassesOfTrainsOrmEntity>,
  ) {}

  async save(trainClass: TrainClass): Promise<TrainClass> {
    const saved = await this.repository.save(
      TrainClassMapper.toOrmEntity(trainClass),
    );
    return TrainClassMapper.toDomain(saved);
  }

  async findAll(): Promise<TrainClass[]> {
    const trainClasses = await this.repository.find();
    return trainClasses.map(TrainClassMapper.toDomain);
  }

  async findById(id: string): Promise<TrainClass | null> {
    const trainClass = await this.repository.findOneBy({ id });
    return trainClass ? TrainClassMapper.toDomain(trainClass) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}