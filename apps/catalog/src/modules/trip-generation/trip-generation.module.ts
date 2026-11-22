
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxModule } from 'libs/outbox/outbox.module';
import { TimetableOrmEntity } from '../timetable/infrastructure/entities/timetable.typeorm.entity';
import { DatedTrip } from '../datedTrip/infrastructure/entities/dated-trip.typeorm.entity';
import { DatedTripStop } from '../dated-trip-stop/infrastructure/entities/dated-trip-stop.typeorm.entity';
import { TripCoach } from '../trip-coach/infrastructure/entities/trip-coach.typeorm.entity';
import { TimeTableStopOrmEntity } from '../timetableStops/infrastructure/entities/timetable-stop.typeorm.entity';
import { CoachOrmEntity } from '../coach/infrastructure/entities/coach.typeorm.entity';
import { Fare } from '../fare/infrastructure/entities/fare.typeorm.entity';
import { TripGenerationController } from './trip-generation.controller';
import { TripGenerationService } from './trip-generation.service';
import { TripGenerationScheduler } from './infrastructure/schedulers/trip-generation.scheduler';
import { TRIP_GENERATION_REPOSITORY } from './domain/repositories/trip-generation.repository';
import { TypeOrmTripGenerationRepository } from './infrastructure/repositories/trip-generation.typeorm.repository';

@Module({
  imports: [
    OutboxModule,
    TypeOrmModule.forFeature([
      TimetableOrmEntity,
      DatedTrip,
      DatedTripStop,
      TripCoach,
      TimeTableStopOrmEntity,
      CoachOrmEntity,
      Fare,
    ]),
  ],
  controllers: [TripGenerationController],
  providers: [
    { provide: TRIP_GENERATION_REPOSITORY, useClass: TypeOrmTripGenerationRepository },
    TripGenerationService,
    TripGenerationScheduler,
  ],
  exports: [TripGenerationService],
})
export class TripGenerationModule {}
