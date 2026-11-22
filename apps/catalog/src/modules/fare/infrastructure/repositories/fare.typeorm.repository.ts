import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Fare as FareModel } from '../../domain/entities/fare.entity';
import { FareRepository as FareRepositoryPort } from '../../domain/repositories/fare.repository';
import { Fare as FareOrmEntity } from '../entities/fare.typeorm.entity';
import { FareMapper } from '../mapper/fare.mapper';

const RELATIONS = ['train', 'trainClass', 'originStation', 'destinationStation'];

@Injectable()
export class TypeOrmFareRepository implements FareRepositoryPort {
  constructor(
    @InjectRepository(FareOrmEntity)
    private readonly repository: Repository<FareOrmEntity>,
  ) {}

  async save(fare: FareModel): Promise<FareModel> {
    const saved = await this.repository.save(FareMapper.toOrmEntity(fare));
    const loaded = await this.findById(saved.id);
    if (!loaded) throw new Error('Saved fare could not be loaded');
    return loaded;
  }

  async findAll(): Promise<FareModel[]> {
    const fares = await this.repository.find({
      relations: RELATIONS,
      order: { effectiveFrom: 'DESC' },
    });
    return fares.map(FareMapper.toDomain);
  }

  async findById(id: string): Promise<FareModel | null> {
    const fare = await this.repository.findOne({
      where: { id },
      relations: RELATIONS,
    });
    return fare ? FareMapper.toDomain(fare) : null;
  }

  /** The fare in force at `at` ("what did this pair cost at 10:42 yesterday"). */
  async findCurrent(
    trainId: string,
    trainClassId: string,
    originStationId: string,
    destinationStationId: string,
    at: Date = new Date(),
  ): Promise<FareModel | null> {
    const fare = await this.repository.findOne({
      where: {
        train: { id: trainId },
        trainClass: { id: trainClassId },
        originStation: { id: originStationId },
        destinationStation: { id: destinationStationId },
        effectiveFrom: LessThanOrEqual(at),
      },
      relations: RELATIONS,
      order: { effectiveFrom: 'DESC' },
    });
    return fare ? FareMapper.toDomain(fare) : null;
  }
}