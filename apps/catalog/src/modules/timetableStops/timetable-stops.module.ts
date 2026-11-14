
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeTableStop } from './TimetableStop.entitiy';
import { TimetableStopsController } from './timetable-stops.controller';
import { TimetableStopsService } from './timetable-stops.service';
import { TimetableStopsRepository } from './timetable-stops.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TimeTableStop])],
  controllers: [TimetableStopsController],
  providers: [TimetableStopsService, TimetableStopsRepository],
  exports: [TimetableStopsService, TimetableStopsRepository],
})
export class TimetableStopsModule {}
