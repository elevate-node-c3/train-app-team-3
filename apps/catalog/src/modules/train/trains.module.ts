import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainOrmEntity } from './infrastructure/entities/train.typeorm.entity';
import { TypeOfTrainOrmEntity } from '../trainType/infrastructure/entities/train-type.typeorm.entity';
import { TrainsController } from './trains.controller';
import { TrainsService } from './trains.service';
import { TRAIN_REPOSITORY } from './domain/repositories/train.repository';
import { TypeOrmTrainsRepository } from './infrastructure/repositories/trains.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TrainOrmEntity, TypeOfTrainOrmEntity])],
  controllers: [TrainsController],
  providers: [
    { provide: TRAIN_REPOSITORY, useClass: TypeOrmTrainsRepository },
    TrainsService,
  ],
  exports: [TrainsService],
})
export class TrainsModule {}