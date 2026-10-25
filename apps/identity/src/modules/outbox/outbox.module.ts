
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OutboxRelayService } from './outbox-relay.service';
import { OutboxEvent } from './ outbox.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OutboxEvent])],
  providers: [OutboxRelayService],
})
export class OutboxModule {}
