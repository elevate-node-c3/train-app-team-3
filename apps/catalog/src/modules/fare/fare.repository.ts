import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, LessThanOrEqual, Repository } from 'typeorm';
import { Fare } from './fare.entity';

const RELATIONS = ['train', 'trainClass', 'originStation', 'destinationStation'];

@Injectable()
export class FareRepository {
  constructor(
    @InjectRepository(Fare)
    private readonly repository: Repository<Fare>,
  ) {}

  create(data: DeepPartial<Fare>) {
    return this.repository.create(data);
  }

  save(fare: Fare) {
    return this.repository.save(fare);
  }

  findAll() {
    return this.repository.find({
      relations: RELATIONS,
      order: { effectiveFrom: 'DESC' },
    });
  }

  findById(id: string) {
    return this.repository.findOne({ where: { id }, relations: RELATIONS });
  }

  /** The fare in force at `at` ("what did this pair cost at 10:42 yesterday"). */
  findCurrent(
    trainId: string,
    trainClassId: string,
    originStationId: string,
    destinationStationId: string,
    at: Date = new Date(),
  ) {
    return this.repository.findOne({
      where: {
        train: { id: trainId },
        trainClass: { id: trainClassId },
        originStation: { id: originStationId },
        destinationStation: { id: destinationStationId },
        effectiveFrom: LessThanOrEqual(at),
      },
      order: { effectiveFrom: 'DESC' },
    });
  }
}