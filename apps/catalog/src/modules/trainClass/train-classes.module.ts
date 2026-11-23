import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesOfTrains } from './train-class.entity';
import { TrainClassesController } from './train-classes.controller';
import { TrainClassesService } from './train-classes.service';
import { TrainClassesRepository } from './train-classes.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ClassesOfTrains])],
  controllers: [TrainClassesController],
  providers: [TrainClassesService, TrainClassesRepository],
  exports: [TrainClassesService, TrainClassesRepository],
})
export class TrainClassesModule {}