import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RabbitMQService } from '@app/messaging';
import { OutboxEncryptionService } from './outbox-encryption.service';
import { OutboxRepository } from './outbox.repository';

const POLL_INTERVAL_MS = 1000; 

@Injectable()
export class OutboxRelayService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxRelayService.name);
  private timer?: ReturnType<typeof setInterval>;
  private running = false;

  constructor(
    private readonly dataSource: DataSource,
    private readonly outbox: OutboxRepository,
    private readonly outboxEncryptionService: OutboxEncryptionService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => void this.sendPending(), POLL_INTERVAL_MS);
    void this.sendPending();
  }

  private async sendPending() {
    if (this.running) return;
    this.running = true;

    try {
      await this.dataSource.transaction(async (manager) => {
        const events = await this.outbox.findPendingLocked(manager);

        for (const event of events) {
          let payload: unknown;

          try {
            payload = this.outboxEncryptionService.decryptPayload(event.payload);
          } catch (error) {
            this.logger.error(`Cannot decrypt outbox event ${event.eventId}`, error);
            continue;
          }

          try {
            await this.rabbitMQService.publishEvent(event.eventType, payload);
          } catch (error) {
            this.logger.error('Broker unavailable, will retry next tick', error);
            break;
          }

          await this.outbox.markAsSent(event.eventId, manager);
        }
      });
    } catch (error) {
      this.logger.error('Failed to relay outbox events', error);
    } finally {
      this.running = false;
    }
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}