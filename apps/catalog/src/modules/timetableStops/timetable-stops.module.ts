
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeTableStopOrmEntity } from './infrastructure/entities/timetable-stop.typeorm.entity';
import { TimetableStopsController } from './timetable-stops.controller';
import { TimetableStopsService } from './timetable-stops.service';
import { TIMETABLE_STOP_REPOSITORY } from './domain/repositories/timetable-stop.repository';
import { TypeOrmTimetableStopRepository } from './infrastructure/repositories/timetable-stops.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TimeTableStopOrmEntity])],
  controllers: [TimetableStopsController],
  providers: [
    { provide: TIMETABLE_STOP_REPOSITORY, useClass: TypeOrmTimetableStopRepository },
    TimetableStopsService,
  ],
  exports: [TimetableStopsService],
})
export class TimetableStopsModule {}
