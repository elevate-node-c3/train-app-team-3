import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachOrmEntity } from './infrastructure/entities/coach.typeorm.entity';
import { CoachesController } from './coaches.controller';
import { CoachesService } from './coaches.service';
import { COACH_REPOSITORY } from './domain/repositories/coach.repository';
import { TypeOrmCoachesRepository } from './infrastructure/repositories/coaches.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CoachOrmEntity])],
  controllers: [CoachesController],
  providers: [
    { provide: COACH_REPOSITORY, useClass: TypeOrmCoachesRepository },
    CoachesService,
  ],
  exports: [CoachesService],
})
export class CoachesModule {}
