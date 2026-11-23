import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coach } from './coach.entity';
import { CoachesController } from './coaches.controller';
import { CoachesService } from './coaches.service';
import { CoachesRepository } from './coaches.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Coach])],
  controllers: [CoachesController],
  providers: [CoachesService, CoachesRepository],
  exports: [CoachesService, CoachesRepository],
})
export class CoachesModule {}
