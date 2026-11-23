import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Train } from './train.entity';
import { TypeOfTrain } from '../trainType/train-type.entity';
import { TrainsController } from './trains.controller';
import { TrainsService } from './trains.service';
import { TrainsRepository } from './trains.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Train, TypeOfTrain])],
  controllers: [TrainsController],
  providers: [TrainsService, TrainsRepository],
  exports: [TrainsService, TrainsRepository],
})
export class TrainsModule {}