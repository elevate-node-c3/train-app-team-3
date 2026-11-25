import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachLayout } from './infrastructure/entities/coach-layout.typeorm.entity';
import { LayoutSeat } from './infrastructure/entities/layout-seat.typeorm.entity';
import { CoachLayoutController } from './coach-layouts.controller';
import { CoachLayoutService } from './coach-layouts.service';
import {
  COACH_LAYOUT_REPOSITORY,
  LAYOUT_SEAT_REPOSITORY,
} from './domain/repositories/coach-layout.repository';
import { TypeOrmCoachLayoutRepository } from './infrastructure/repositories/coach-layouts.typeorm.repository';
import { TypeOrmLayoutSeatRepository } from './infrastructure/repositories/layout-seat.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CoachLayout, LayoutSeat])],
  controllers: [CoachLayoutController],
  providers: [
    { provide: COACH_LAYOUT_REPOSITORY, useClass: TypeOrmCoachLayoutRepository },
    { provide: LAYOUT_SEAT_REPOSITORY, useClass: TypeOrmLayoutSeatRepository },
    CoachLayoutService,
  ],
  exports: [CoachLayoutService],
})
export class CoachLayoutModule {}