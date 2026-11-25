import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationOrmEntity } from './infrastructure/entities/stations.typeorm.entity';
import { StationsController } from './stations.controller';
import { STATION_REPOSITORY } from './domain/repositories/station.repository';
import { TypeOrmStationRepository } from './infrastructure/repositories/stations.typeorm.repository';
import { StationsService } from './stations.service';
import { CitiesModule } from '../cities/cities.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StationOrmEntity]),
    CitiesModule,
  ],
  controllers: [StationsController],
  providers: [
    { provide: STATION_REPOSITORY, useClass: TypeOrmStationRepository },
    StationsService,
  ],
})
export class StationsModule {}