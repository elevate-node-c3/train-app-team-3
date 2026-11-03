import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxRelayService } from './outbox-relay.service';
import { OutboxEvent } from './outbox.entity';
import { OutboxRepository } from './outbox.repository';
import { OutboxEncryptionService } from './outbox-encryption.service';
import { RabbitMQService } from './rabbitmq.service';


@Module({
  imports: [TypeOrmModule.forFeature([OutboxEvent])],
  providers: [
    OutboxRelayService,
    OutboxRepository,
    OutboxEncryptionService,
    RabbitMQService,
  ],
})
export class OutboxModule {}
