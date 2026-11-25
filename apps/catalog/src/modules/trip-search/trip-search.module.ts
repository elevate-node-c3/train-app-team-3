import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatedTripStop } from '../dated-trip-stop/infrastructure/entities/dated-trip-stop.typeorm.entity';
import { Fare } from '../fare/infrastructure/entities/fare.typeorm.entity';
import { StationOrmEntity } from '../stations/infrastructure/entities/stations.typeorm.entity';
import { ClassesOfTrainsOrmEntity } from '../trainClass/infrastructure/entities/train-class.typeorm.entity';
import { TrainOrmEntity } from '../train/infrastructure/entities/train.typeorm.entity';
import { TripCoach } from '../trip-coach/infrastructure/entities/trip-coach.typeorm.entity';
import { CoachOrmEntity } from '../coach/infrastructure/entities/coach.typeorm.entity';
import { CoachLayout } from '../coachLayout/infrastructure/entities/coach-layout.typeorm.entity';
import { LayoutSeat } from '../coachLayout/infrastructure/entities/layout-seat.typeorm.entity';
import { TRIP_AVAILABILITY_PROVIDER } from './domain/trip-availability.provider';
import { TRIP_SEARCH_REPOSITORY } from './domain/trip-search.repository';
import { TypeOrmTripSearchRepository } from './infrastructure/repositories/trip-search.typeorm.repository';
import { TripCoachCapacityProvider } from './infrastructure/providers/trip-coach-capacity.provider';
import { TripSearchController } from './trip-search.controller';
import { TripSearchService } from './trip-search.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DatedTripStop,
      Fare,
      StationOrmEntity,
      ClassesOfTrainsOrmEntity,
      TrainOrmEntity,
      TripCoach,
      CoachOrmEntity,
      CoachLayout,
      LayoutSeat,
    ]),
  ],
  controllers: [TripSearchController],
  providers: [
    { provide: TRIP_SEARCH_REPOSITORY, useClass: TypeOrmTripSearchRepository },
    {
      provide: TRIP_AVAILABILITY_PROVIDER,
      useClass: TripCoachCapacityProvider,
    },
    TripSearchService,
  ],
})
export class TripSearchModule {}
