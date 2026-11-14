import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coach } from './coach.entity';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';

@Injectable()
export class CoachesRepository {
  constructor(
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
  ) {}

  create(dto: CreateCoachDto) {
    const coach = this.coachRepository.create({
      coachNumber: dto.coachNumber,
      train: { id: dto.trainId },
      classOfTrain: { id: dto.classOfTrainId },
      coachLayout: { id: dto.coachLayoutId },
    });

    return this.coachRepository.save(coach);
  }

  findAll() {
    return this.coachRepository.find({
      relations: {
        train: true,
        classOfTrain: true,
        coachLayout: true,
      },
    });
  }

  findById(id: string) {
    return this.coachRepository.findOne({
      where: { id },
      relations: {
        train: true,
        classOfTrain: true,
        coachLayout: true,
      },
    });
  }

  async update(id: string, dto: UpdateCoachDto) {
    const coach = await this.coachRepository.findOneBy({ id });

    if (!coach) return null;

    Object.assign(coach, {
      ...(dto.coachNumber !== undefined && { coachNumber: dto.coachNumber }),
      ...(dto.trainId && { train: { id: dto.trainId } }),
      ...(dto.classOfTrainId && { classOfTrain: { id: dto.classOfTrainId } }),
      ...(dto.coachLayoutId && { coachLayout: { id: dto.coachLayoutId } }),
    });

    return this.coachRepository.save(coach);
  }

  async delete(id: string) {
    await this.coachRepository.delete(id);
  }
  
}
