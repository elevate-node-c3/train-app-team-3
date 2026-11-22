
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTimetableStopDto } from './application/dtos/create-timetable-stop.dto';
import { UpdateTimetableStopDto } from './application/dtos/update-timetable-stop.dto';
import {
  TIMETABLE_STOP_REPOSITORY,
  TimetableStopRepository,
} from './domain/repositories/timetable-stop.repository';

@Injectable()
export class TimetableStopsService {
  constructor(
    @Inject(TIMETABLE_STOP_REPOSITORY)
    private readonly timetableStopsRepository: TimetableStopRepository,
  ) {}

  create(dto: CreateTimetableStopDto) {
    return this.timetableStopsRepository.create(dto);
  }

  findAll() {
    return this.timetableStopsRepository.findAll();
  }

  async findOne(id: string) {
    const stop = await this.timetableStopsRepository.findById(id);

    if (!stop) {
      throw new NotFoundException('Timetable stop not found');
    }

    return stop;
  }

  async update(id: string, dto: UpdateTimetableStopDto) {
    await this.findOne(id);
    const updatedStop = await this.timetableStopsRepository.update(id, dto);
    if (!updatedStop) {
      throw new NotFoundException('Timetable stop not found');
    }

    return updatedStop;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.timetableStopsRepository.delete(id);

    return { message: 'Timetable stop deleted successfully' };
  }
}
