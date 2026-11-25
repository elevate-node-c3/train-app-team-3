import { CreateTimetableDto } from '../../application/dtos/create-timetable.dto';
import { UpdateTimetableDto } from '../../application/dtos/update-timetable.dto';
import { Timetable } from '../entities/timetable.entity';

export const TIMETABLE_REPOSITORY = Symbol('TIMETABLE_REPOSITORY');

export interface PublishedTimetable {
  trainId: string;
  version: number;
  effectiveFrom: Date;
  effectiveTo: Date;
}

export interface TimetableRepository {
  create(dto: CreateTimetableDto): Promise<Timetable>;
  findAll(): Promise<Timetable[]>;
  findById(id: string): Promise<Timetable | null>;
  update(id: string, dto: UpdateTimetableDto): Promise<Timetable | null>;
  delete(id: string): Promise<void>;
  publish(id: string): Promise<PublishedTimetable>;
}
