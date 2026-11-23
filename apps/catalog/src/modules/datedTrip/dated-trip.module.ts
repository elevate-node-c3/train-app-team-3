import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxModule } from 'libs/outbox/outbox.module';
import { Timetable } from '../timetable/timetable.entity';
import { DatedTrip } from './dated-trip.entity';
import { DatedTripRepository } from './dated-trip.repository';
import { DatedTripService } from './dated-trip.service';
import { DatedTripController } from './dated-trip.controller';
import { TripGenerationModule } from '../trip-generation/trip-generation.module';

@Module({
  imports: [TypeOrmModule.forFeature([DatedTrip, Timetable]), OutboxModule, TripGenerationModule],
  controllers: [DatedTripController],
  providers: [DatedTripService, DatedTripRepository],
  exports: [DatedTripService, DatedTripRepository],
})
export class DatedTripModule {}