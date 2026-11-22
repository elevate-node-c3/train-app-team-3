
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTimetableStopDto } from '../../application/dtos/create-timetable-stop.dto';
import { UpdateTimetableStopDto } from '../../application/dtos/update-timetable-stop.dto';
import { TimetableStop } from '../../domain/entities/timetable-stop.entity';
import { TimetableStopRepository } from '../../domain/repositories/timetable-stop.repository';
import { TimeTableStopOrmEntity } from '../entities/timetable-stop.typeorm.entity';
import { TimetableStopMapper } from '../mapper/timetable-stop.mapper';

@Injectable()
export class TypeOrmTimetableStopRepository implements TimetableStopRepository {
  constructor(
    @InjectRepository(TimeTableStopOrmEntity)
    private readonly timetableStopRepository: Repository<TimeTableStopOrmEntity>,
  ) {}

  async create(dto: CreateTimetableStopDto): Promise<TimetableStop> {
    const stop = this.timetableStopRepository.create({
      arrivalTime: dto.arrivalTime ?? null,
      departureTime: dto.departureTime ?? null,
      stopOrder: dto.stopOrder,
      timeTable: { id: dto.timetableId },
      station: { id: dto.stationId },
    });

    const saved = await this.timetableStopRepository.save(stop);
    const loaded = await this.findById(saved.id);
    if (!loaded) throw new Error('Created timetable stop could not be loaded');
    return loaded;
  }

  async findAll(): Promise<TimetableStop[]> {
    const stops = await this.timetableStopRepository.find({
      relations: {
        timeTable: true,
        station: true,
      },
      order: { stopOrder: 'ASC' },
    });
    return stops.map(TimetableStopMapper.toDomain);
  }

  async findById(id: string): Promise<TimetableStop | null> {
    const stop = await this.timetableStopRepository.findOne({
      where: { id },
      relations: {
        timeTable: true,
        station: true,
      },
    });
    return stop ? TimetableStopMapper.toDomain(stop) : null;
  }

  async update(id: string, dto: UpdateTimetableStopDto): Promise<TimetableStop | null> {
    const stop = await this.timetableStopRepository.findOne({
      where: { id },
      relations: { timeTable: true, station: true },
    });

    if (!stop) return null;

    Object.assign(stop, {
      ...(dto.arrivalTime !== undefined && { arrivalTime: dto.arrivalTime }),
      ...(dto.departureTime !== undefined && { departureTime: dto.departureTime }),
      ...(dto.stopOrder !== undefined && { stopOrder: dto.stopOrder }),
      ...(dto.timetableId !== undefined && { timeTable: { id: dto.timetableId } }),
      ...(dto.stationId !== undefined && { station: { id: dto.stationId } }),
    });

    await this.timetableStopRepository.save(stop);
    return this.findById(id);
  }

  async delete(id: string) {
    await this.timetableStopRepository.delete(id);
  }
}
