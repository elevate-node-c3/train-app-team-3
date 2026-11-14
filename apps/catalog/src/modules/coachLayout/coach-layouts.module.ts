import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachLayout } from './coach-layout.entity';
import { LayoutSeat } from './layout-seat.entity';
import { LayoutSeatRepository } from './layout-seat.repository';
import { CoachLayoutController } from './coach-layouts.controller';
import { CoachLayoutService } from './coach-layouts.service';
import { CoachLayoutRepository } from './coach-layouts.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CoachLayout, LayoutSeat])],
  controllers: [CoachLayoutController],
  providers: [
    CoachLayoutService,
    CoachLayoutRepository,
    LayoutSeatRepository,
  ],
  exports: [CoachLayoutService],
})
export class CoachLayoutModule {}