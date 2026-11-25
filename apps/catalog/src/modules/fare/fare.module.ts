import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fare } from './infrastructure/entities/fare.typeorm.entity';
import { FARE_REPOSITORY } from './domain/repositories/fare.repository';
import { TypeOrmFareRepository } from './infrastructure/repositories/fare.typeorm.repository';
import { FareController } from './fare.controller';
import { FareService } from './fare.service';

@Module({
  imports: [TypeOrmModule.forFeature([Fare])],
  controllers: [FareController],
  providers: [
    { provide: FARE_REPOSITORY, useClass: TypeOrmFareRepository },
    FareService,
  ],
  exports: [FareService],
})
export class FareModule {}