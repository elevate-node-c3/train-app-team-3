import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GovernorateOrmEntity } from '../governorates/infrastructure/entities/governorates.typeorm.entity';
import { CityOrmEntity } from './infrastructure/entities/city.typeorm.entity';
import { CitiesController } from './cities.controller';
import { CITY_REPOSITORY } from './domain/repositories/city.repository';
import { TypeOrmCitiesRepository } from './infrastructure/repositories/cities.typeorm.repository';
import { CitiesService } from './cities.service';
import { GovernoratesModule } from '../governorates/governorates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CityOrmEntity, GovernorateOrmEntity]),
    GovernoratesModule,
  ],
  controllers: [CitiesController],
  providers: [
    { provide: CITY_REPOSITORY, useClass: TypeOrmCitiesRepository },
    CitiesService,
  ],
  exports: [CitiesService],
})
export class CitiesModule {}
