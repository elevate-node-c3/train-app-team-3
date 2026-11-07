import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingModule } from '@app/messaging';
import { OutboxRelayService } from './outbox-relay.service';
import { OutboxEvent } from './outbox.entity';
import { OutboxRepository } from './outbox.repository';
import { OutboxEncryptionService } from './outbox-encryption.service';

@Module({
  imports: [TypeOrmModule.forFeature([OutboxEvent]), MessagingModule],
  providers: [OutboxRelayService, OutboxRepository, OutboxEncryptionService],
  exports: [OutboxEncryptionService],
})
export class OutboxModule {}