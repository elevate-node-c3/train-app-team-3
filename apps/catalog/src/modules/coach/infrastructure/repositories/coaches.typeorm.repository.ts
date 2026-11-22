import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoachOrmEntity } from '../entities/coach.typeorm.entity';
import { Coach } from '../../domain/entities/coach.entity';
import { CoachRepository } from '../../domain/repositories/coach.repository';
import { CoachMapper } from '../mapper/coach.mapper';

@Injectable()
export class TypeOrmCoachesRepository implements CoachRepository {
  constructor(
    @InjectRepository(CoachOrmEntity)
    private readonly coachRepository: Repository<CoachOrmEntity>,
  ) {}

  async create(coach: Coach): Promise<Coach> {
    const saved = await this.coachRepository.save(
      CoachMapper.toOrmEntity(coach),
    );
    return CoachMapper.toDomain(saved);
  }

  async findAll(): Promise<Coach[]> {
    const coaches = await this.coachRepository.find({
      relations: {
        train: true,
        classOfTrain: true,
        coachLayout: true,
      },
    });
    return coaches.map(CoachMapper.toDomain);
  }

  async findById(id: string): Promise<Coach | null> {
    const coach = await this.coachRepository.findOne({
      where: { id },
      relations: {
        train: true,
        classOfTrain: true,
        coachLayout: true,
      },
    });
    return coach ? CoachMapper.toDomain(coach) : null;
  }

  async update(coach: Coach): Promise<Coach | null> {
    const existing = await this.coachRepository.findOneBy({ id: coach.id });

    if (!existing) return null;

    const updated = CoachMapper.toOrmEntity(coach);
    existing.coachNumber = updated.coachNumber;
    existing.train = updated.train;
    existing.classOfTrain = updated.classOfTrain;
    existing.coachLayout = updated.coachLayout;

    const saved = await this.coachRepository.save(existing);
    return CoachMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.coachRepository.delete(id);
  }
}
