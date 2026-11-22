import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxModule } from 'libs/outbox/outbox.module';
import { TimetableOrmEntity } from './infrastructure/entities/timetable.typeorm.entity';
import { TimetablesController } from './timetables.controller';
import { TimetablesService } from './timetables.service';
import { TIMETABLE_REPOSITORY } from './domain/repositories/timetable.repository';
import { TypeOrmTimetableRepository } from './infrastructure/repositories/timetables.typeorm.repository';
import { TripGenerationModule } from '../trip-generation/trip-generation.module';

@Module({
  imports: [TypeOrmModule.forFeature([TimetableOrmEntity]), OutboxModule, TripGenerationModule],
  controllers: [TimetablesController],
  providers: [
    { provide: TIMETABLE_REPOSITORY, useClass: TypeOrmTimetableRepository },
    TimetablesService,
  ],
  exports: [TimetablesService],
})
export class TimetablesModule {}