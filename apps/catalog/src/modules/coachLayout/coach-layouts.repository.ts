import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoachLayout } from './coach-layout.entity';

@Injectable()
export class CoachLayoutRepository {
  constructor(
    @InjectRepository(CoachLayout)
    private readonly repository: Repository<CoachLayout>,
  ) {}

  create(data: Partial<CoachLayout>) {
    return this.repository.create(data);
  }

  save(layout: CoachLayout) {
    return this.repository.save(layout);
  }

  findAll() {
    return this.repository.find({
      relations: ['seats'],
    });
  }

  findById(id: string) {
    return this.repository.findOne({
      where: { id },
      relations: ['seats', 'coaches'],
    });
  }

  remove(layout: CoachLayout) {
    return this.repository.remove(layout);
  }
}