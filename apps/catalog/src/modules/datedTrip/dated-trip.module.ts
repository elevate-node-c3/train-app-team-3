import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxModule } from 'libs/outbox/outbox.module';
import { DatedTrip } from './infrastructure/entities/dated-trip.typeorm.entity';
import { DatedTripService } from './dated-trip.service';
import { DatedTripController } from './dated-trip.controller';
import { TripGenerationModule } from '../trip-generation/trip-generation.module';
import { DATED_TRIP_REPOSITORY } from './domain/repositories/dated-trip.repository';
import { TypeOrmDatedTripRepository } from './infrastructure/repositories/dated-trip.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DatedTrip]), OutboxModule, TripGenerationModule],
  controllers: [DatedTripController],
  providers: [
    { provide: DATED_TRIP_REPOSITORY, useClass: TypeOrmDatedTripRepository },
    DatedTripService,
  ],
  exports: [DatedTripService],
})
export class DatedTripModule {}