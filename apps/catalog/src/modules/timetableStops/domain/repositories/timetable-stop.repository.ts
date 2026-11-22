import { CreateTimetableStopDto } from '../../application/dtos/create-timetable-stop.dto';
import { UpdateTimetableStopDto } from '../../application/dtos/update-timetable-stop.dto';
import { TimetableStop } from '../entities/timetable-stop.entity';

export const TIMETABLE_STOP_REPOSITORY = Symbol('TIMETABLE_STOP_REPOSITORY');

export interface TimetableStopRepository {
  create(dto: CreateTimetableStopDto): Promise<TimetableStop>;
  findAll(): Promise<TimetableStop[]>;
  findById(id: string): Promise<TimetableStop | null>;
  update(id: string, dto: UpdateTimetableStopDto): Promise<TimetableStop | null>;
  delete(id: string): Promise<void>;
}
