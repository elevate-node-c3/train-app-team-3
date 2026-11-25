import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOfTrainOrmEntity } from './infrastructure/entities/train-type.typeorm.entity';
import { TrainTypesController } from './train-types.controller';
import { TrainTypesService } from './train-types.service';
import { TRAIN_TYPE_REPOSITORY } from './domain/repositories/train-type.repository';
import { TypeOrmTrainTypeRepository } from './infrastructure/repositories/train-types.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOfTrainOrmEntity])],
  controllers: [TrainTypesController],
  providers: [
    { provide: TRAIN_TYPE_REPOSITORY, useClass: TypeOrmTrainTypeRepository },
    TrainTypesService,
  ],
  exports: [TrainTypesService],
})
export class TrainTypesModule {}