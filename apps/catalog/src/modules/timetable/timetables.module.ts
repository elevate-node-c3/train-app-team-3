import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxModule } from 'libs/outbox/outbox.module';
import { Timetable } from './timetable.entity';
import { TimetablesController } from './timetables.controller';
import { TimetablesService } from './timetables.service';
import { TimetablesRepository } from './timetables.repository';
import { TripGenerationModule } from '../trip-generation/trip-generation.module';

@Module({
  imports: [TypeOrmModule.forFeature([Timetable]), OutboxModule, TripGenerationModule],
  controllers: [TimetablesController],
  providers: [TimetablesService, TimetablesRepository],
  exports: [TimetablesService, TimetablesRepository],
})
export class TimetablesModule {}