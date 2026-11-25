import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateCoachDto } from './application/dtos/create-coach.dto';
import { UpdateCoachDto } from './application/dtos/update-coach.dto';
import { Coach } from './domain/entities/coach.entity';
import {
  COACH_REPOSITORY,
  CoachRepository,
} from './domain/repositories/coach.repository';

@Injectable()
export class CoachesService {
  constructor(
    @Inject(COACH_REPOSITORY)
    private readonly coachesRepository: CoachRepository,
  ) {}

  create(dto: CreateCoachDto) {
    const now = new Date();
    return this.coachesRepository.create(
      new Coach(
        randomUUID(),
        dto.coachNumber,
        { id: dto.trainId },
        { id: dto.classOfTrainId },
        { id: dto.coachLayoutId },
        now,
        now,
      ),
    );
  }

  findAll() {
    return this.coachesRepository.findAll();
  }

  async findOne(id: string) {
    const coach = await this.coachesRepository.findById(id);

    if (!coach) {
      throw new NotFoundException('Coach not found');
    }

    return coach;
  }

  async update(id: string, dto: UpdateCoachDto) {
    const coach = await this.findOne(id);
    coach.coachNumber = dto.coachNumber ?? coach.coachNumber;
    if (dto.trainId) coach.train = { id: dto.trainId };
    if (dto.classOfTrainId) coach.classOfTrain = { id: dto.classOfTrainId };
    if (dto.coachLayoutId) coach.coachLayout = { id: dto.coachLayoutId };

    const updatedCoach = await this.coachesRepository.update(coach);
    if (!updatedCoach) {
      throw new NotFoundException('Coach not found');
    }

    return updatedCoach;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.coachesRepository.delete(id);

    return { message: 'Coach deleted successfully' };
  }
}
