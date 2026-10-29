import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxEvent } from './entities/outbox-event.entity';
import { OutboxRelayService } from './outbox-relay.service';

@Module({
    imports: [TypeOrmModule.forFeature([OutboxEvent])],
    providers: [OutboxRelayService],
    exports: [OutboxRelayService, TypeOrmModule],
})
export class OutboxModule { }
