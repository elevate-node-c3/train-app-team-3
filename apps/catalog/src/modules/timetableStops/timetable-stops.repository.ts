
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTimetableStopDto } from './dto/create-timetable-stop.dto';
import { UpdateTimetableStopDto } from './dto/update-timetable-stop.dto';
import { TimeTableStop } from './TimetableStop.entitiy';

@Injectable()
export class TimetableStopsRepository {
  constructor(
    @InjectRepository(TimeTableStop)
    private readonly timetableStopRepository: Repository<TimeTableStop>,
  ) {}

  create(dto: CreateTimetableStopDto) {
    const stop = this.timetableStopRepository.create({
      arrivalTime: dto.arrivalTime ?? null,
      departureTime: dto.departureTime ?? null,
      stopOrder: dto.stopOrder,
      timeTable: { id: dto.timetableId },
      station: { id: dto.stationId },
    });

    return this.timetableStopRepository.save(stop);
  }

  findAll() {
    return this.timetableStopRepository.find({
      relations: {
        timeTable: true,
        station: true,
      },
      order: { stopOrder: 'ASC' },
    });
  }

  findById(id: string) {
    return this.timetableStopRepository.findOne({
      where: { id },
      relations: {
        timeTable: true,
        station: true,
      },
    });
  }

  async update(id: string, dto: UpdateTimetableStopDto) {
    const stop = await this.findById(id);

    if (!stop) return null;

    Object.assign(stop, {
      ...(dto.arrivalTime !== undefined && { arrivalTime: dto.arrivalTime }),
      ...(dto.departureTime !== undefined && { departureTime: dto.departureTime }),
      ...(dto.stopOrder !== undefined && { stopOrder: dto.stopOrder }),
      ...(dto.timetableId !== undefined && { timeTable: { id: dto.timetableId } }),
      ...(dto.stationId !== undefined && { station: { id: dto.stationId } }),
    });

    return this.timetableStopRepository.save(stop);
  }

  async delete(id: string) {
    await this.timetableStopRepository.delete(id);
  }
}
