import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { OutboxEncryptionService } from './outbox-encryption.service';
import { OutboxRepository } from './outbox.repository';
import { RabbitMQService } from './rabbitmq.service';

@Injectable()
export class OutboxRelayService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxRelayService.name);
  private timer?: ReturnType<typeof setInterval>;
  private running = false;

  constructor(
    private readonly outbox: OutboxRepository,
    private readonly outboxEncryptionService: OutboxEncryptionService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => void this.sendPending(), 1000);
    void this.sendPending();
  }

  private async sendPending() {
    if (this.running) return;
    this.running = true;

    try {
      const events = await this.outbox.findPending();

      for (const event of events) {
        const payload = this.outboxEncryptionService.decryptPayload(event.payload);

        await this.rabbitMQService.publishEvent(payload);
        await this.outbox.markAsSent(event.eventId);
      }
    } catch (error) {
      this.logger.error('Failed to send pending outbox events', error);
    } finally {
      this.running = false;
    }
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
