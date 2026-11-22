import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesOfTrainsOrmEntity } from './infrastructure/entities/train-class.typeorm.entity';
import { TrainClassesController } from './train-classes.controller';
import { TrainClassesService } from './train-classes.service';
import { TRAIN_CLASS_REPOSITORY } from './domain/repositories/train-class.repository';
import { TypeOrmTrainClassRepository } from './infrastructure/repositories/train-classes.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ClassesOfTrainsOrmEntity])],
  controllers: [TrainClassesController],
  providers: [
    { provide: TRAIN_CLASS_REPOSITORY, useClass: TypeOrmTrainClassRepository },
    TrainClassesService,
  ],
  exports: [TrainClassesService],
})
export class TrainClassesModule {}