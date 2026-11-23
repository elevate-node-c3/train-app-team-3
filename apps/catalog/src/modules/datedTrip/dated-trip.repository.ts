import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { DatedTrip } from './dated-trip.entity';

@Injectable()
export class DatedTripRepository {
  constructor(
    @InjectRepository(DatedTrip)
    private readonly repository: Repository<DatedTrip>,
  ) {}

  create(data: DeepPartial<DatedTrip>) {
    return this.repository.create(data);
  }

  save(trip: DatedTrip) {
    return this.repository.save(trip);
  }

  findAll() {
    return this.repository.find({
      relations: ['train', 'timetable'],
      order: { serviceDate: 'ASC' },
    });
  }

  findById(id: string) {
    return this.repository.findOne({
      where: { id },
      relations: ['train', 'timetable'],
    });
  }

  findByTrainAndDate(trainId: string, serviceDate: string) {
    return this.repository.findOne({
      where: {
        train: { id: trainId },
        serviceDate,
      },
    });
  }

  remove(trip: DatedTrip) {
    return this.repository.remove(trip);
  }
}