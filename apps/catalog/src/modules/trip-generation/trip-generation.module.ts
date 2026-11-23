
import { Module } from '@nestjs/common';
import { OutboxModule } from 'libs/outbox/outbox.module';
import { TripGenerationController } from './trip-generation.controller';
import { TripGenerationService } from './trip-generation.service';
import { TripGenerationScheduler } from './trip-generation.scheduler';

@Module({
  imports: [OutboxModule],
  controllers: [TripGenerationController],
  providers: [TripGenerationService, TripGenerationScheduler],
})
export class TripGenerationModule {}
