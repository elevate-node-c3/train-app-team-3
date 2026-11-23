
import { Injectable, NotFoundException } from '@nestjs/common';
import { CoachesRepository } from './coaches.repository';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';

@Injectable()
export class CoachesService {
  constructor(private readonly coachesRepository: CoachesRepository) {}

  create(dto: CreateCoachDto) {
    return this.coachesRepository.create(dto);
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
    await this.findOne(id);
    return this.coachesRepository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.coachesRepository.delete(id);

    return { message: 'Coach deleted successfully' };
  }
}
