import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTimetableDto } from './application/dtos/create-timetable.dto';
import { UpdateTimetableDto } from './application/dtos/update-timetable.dto';
import { TripGenerationService } from '../trip-generation/trip-generation.service';
import {
  TIMETABLE_REPOSITORY,
  TimetableRepository,
} from './domain/repositories/timetable.repository';

@Injectable()
export class TimetablesService {
  private readonly logger = new Logger(TimetablesService.name);

  constructor(
    @Inject(TIMETABLE_REPOSITORY)
    private readonly timetablesRepository: TimetableRepository,
    private readonly tripGeneration: TripGenerationService,
  ) {}

  create(dto: CreateTimetableDto) {
    return this.timetablesRepository.create(dto);
  }

  findAll() {
    return this.timetablesRepository.findAll();
  }

  async findOne(id: string) {
    const timetable = await this.timetablesRepository.findById(id);

    if (!timetable) {
      throw new NotFoundException('Timetable not found');
    }

    return timetable;
  }

  async update(id: string, dto: UpdateTimetableDto) {
    await this.findOne(id);
    const timetable = await this.timetablesRepository.update(id, dto);
    if (!timetable) {
      throw new NotFoundException('Timetable not found');
    }

    return timetable;
  }

  async remove(id: string) {
    const timetable = await this.findOne(id);

    if (timetable.publishedAt) {
      throw new BadRequestException(
        'A published timetable cannot be deleted; set its status to inactive instead',
      );
    }

    await this.timetablesRepository.delete(id);

    return { message: 'Timetable deleted successfully' };
  }

  /**
   * The ONE way a timetable goes live (operator and seed alike): validate stops, composition and the
   * full fare matrix, mark it published with a new version, announce it through the outbox, then
   * generate its trips for the booking window.
   */
  async publish(id: string) {
    const timetable = await this.findOne(id);

    if (!timetable.status) {
      throw new BadRequestException('Timetable is inactive');
    }

    await this.timetablesRepository.publish(id);

    const summary = await this.tripGeneration.generateWindow(id);

    if (summary.failed.length) {
      // The timetable is published; the scheduler retries the failed days on its next run.
      this.logger.warn(`Timetable ${id}: ${summary.failed.length} trips failed to generate`);
    }

    return summary;
  }
}