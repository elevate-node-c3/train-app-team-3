
import { Injectable, NotFoundException } from '@nestjs/common';
import { TimetableStopsRepository } from './timetable-stops.repository';
import { CreateTimetableStopDto } from './dto/create-timetable-stop.dto';
import { UpdateTimetableStopDto } from './dto/update-timetable-stop.dto';

@Injectable()
export class TimetableStopsService {
  constructor(private readonly timetableStopsRepository: TimetableStopsRepository) {}

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
    return this.timetableStopsRepository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.timetableStopsRepository.delete(id);

    return { message: 'Timetable stop deleted successfully' };
  }
}
