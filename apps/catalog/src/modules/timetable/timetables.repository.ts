
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Timetable } from './timetable.entity';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';

@Injectable()
export class TimetablesRepository {
  constructor(
    @InjectRepository(Timetable)
    private readonly timetableRepository: Repository<Timetable>,
  ) {}

  create(dto: CreateTimetableDto) {
    const timetable = this.timetableRepository.create({
      departureTime: dto.departureTime,
      effectiveFrom: new Date(dto.effectiveFrom),
      effectiveTo: new Date(dto.effectiveTo),
      workingDays: dto.workingDays,
      status: dto.status,
      train: { id: dto.trainId },
    });

    return this.timetableRepository.save(timetable);
  }

  findAll() {
    return this.timetableRepository.find({
      relations: { train: true },
    });
  }

  findById(id: string) {
    return this.timetableRepository.findOne({
      where: { id },
      relations: { train: true },
    });
  }

  async update(id: string, dto: UpdateTimetableDto) {
    const timetable = await this.findById(id);

    if (!timetable) return null;

    Object.assign(timetable, {
      ...(dto.departureTime !== undefined && { departureTime: dto.departureTime }),
      ...(dto.effectiveFrom !== undefined && { effectiveFrom: new Date(dto.effectiveFrom) }),
      ...(dto.effectiveTo !== undefined && { effectiveTo: new Date(dto.effectiveTo) }),
      ...(dto.workingDays !== undefined && { workingDays: dto.workingDays }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.trainId !== undefined && { train: { id: dto.trainId } }),
    });

    return this.timetableRepository.save(timetable);
  }

  async delete(id: string) {
    await this.timetableRepository.delete(id);
  }
}
