import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from 'libs/cache/src';
import { DatabaseModule } from './database/database.module';
import catalogConfig from './config/config';
import { configValidationSchema } from './config/config.schema';
import { TrainsModule } from './modules/train/trains.module';
import { GovernoratesModule } from './modules/governorates/governorates.module';
import { CitiesModule } from './modules/cities/cities.module';
import { TrainTypesModule } from './modules/trainType/train-types.module';
import { TrainClassesModule } from './modules/trainClass/train-classes.module';
import { CoachLayoutModule } from './modules/coachLayout/coach-layouts.module';
import { CoachesModule } from './modules/coach/coaches.module';
import { TimetablesModule } from './modules/timetable/timetables.module';
import { TimetableStopsModule } from './modules/timetableStops/timetable-stops.module';
import { StationsModule } from './modules/stations/stations.module';
import { FareModule } from './modules/fare/fare.module';
import { DatedTripModule } from './modules/datedTrip/dated-trip.module';
import { TripGenerationModule } from './modules/trip-generation/trip-generation.module';
import { TripSearchModule } from './modules/trip-search/trip-search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/catalog/.env', '.env'],
      load: [catalogConfig],
      validationSchema: configValidationSchema,
    }),
    ScheduleModule.forRoot(),
    CacheModule.register({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    }),
    DatabaseModule,
    StationsModule,
    GovernoratesModule,
    CitiesModule,
    TrainsModule,
    TrainTypesModule,
    TrainClassesModule,
    CoachLayoutModule,
    CoachesModule,
    FareModule,
    TimetablesModule,
    TimetableStopsModule,
    DatedTripModule,
    TripGenerationModule,
    TripSearchModule,
  ],
})
export class AppModule {}