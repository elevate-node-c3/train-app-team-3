import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOfTrain } from './train-type.entity';
import { TrainTypesController } from './train-types.controller';
import { TrainTypesService } from './train-types.service';
import { TrainTypesRepository } from './train-types.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOfTrain])],
  controllers: [TrainTypesController],
  providers: [TrainTypesService, TrainTypesRepository],
  exports: [TrainTypesService, TrainTypesRepository],
})
export class TrainTypesModule {}