import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Channel, ConsumeMessage } from 'amqplib';
import { DataSource } from 'typeorm';
import {
  MESSAGE_HEADERS,
  NOTIFICATION_DLX,
  NOTIFICATION_MAX_RETRIES,
  NOTIFICATION_RETRY_DELAYS_MS,
  notificationRetryQueue,
  parseVerificationCodeIssued,
  ROUTING_KEYS,
  VerificationCodeIssuedEvent,
} from '@app/contracts';
import { RabbitMQService } from '@app/messaging';
import { ProcessedEvent } from '../../database/entities/processed-event.entity';
import { MailerService } from './mailer.service';



@Controller()
export class NotificationConsumer {
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly mailerService: MailerService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  @EventPattern(ROUTING_KEYS.VERIFICATION_CODE_ISSUED)
  async handleVerificationCodeIssued(
    @Payload() raw: unknown,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const message = context.getMessage() as ConsumeMessage;

    const parsed = parseVerificationCodeIssued(raw);
    if (!parsed.ok) {
      this.logger.error(`Dead-lettering invalid event: ${parsed.reason}`);
      await this.deadLetter(channel, message, parsed.reason);
      return;
    }

    const { event } = parsed;

    try {
      const outcome = await this.processOnce(event);
      if (outcome !== 'sent') {
        this.logger.log(`Event ${event.eventId} not sent: ${outcome}`);
      }
      channel.ack(message); 
    } catch (err) {
      await this.retryOrDeadLetter(channel, message, event.eventId, err);
    }
  }


  private async processOnce(
    event: VerificationCodeIssuedEvent,
  ): Promise<'sent' | 'duplicate' | 'expired'> {
    const { eventId, payload } = event;

    return this.dataSource.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [eventId]);

      const existing = await manager.findOne(ProcessedEvent, { where: { eventId } });
      if (existing) return 'duplicate' as const;

      if (Date.now() > new Date(payload.expiresAt).getTime()) {
        await manager.insert(ProcessedEvent, {
          eventId,
          outcome: 'skipped_expired',
          latencyMs: null,
        });
        return 'expired' as const;
      }

      await this.mailerService.sendVerificationEmail({
        to: payload.email,
        code: payload.code,
        language: payload.language,
      });

      const latencyMs = Date.now() - new Date(event.occurredAt).getTime();
      await manager.insert(ProcessedEvent, { eventId, outcome: 'sent', latencyMs });
      this.logger.log(`otp_delivery_latency_ms=${latencyMs} eventId=${eventId}`);

      return 'sent' as const;
    });
  }

  private async retryOrDeadLetter(
    channel: Channel,
    message: ConsumeMessage,
    eventId: string,
    err: unknown,
  ) {
    const reason = this.describe(err);
    const attempt = Number(message.properties.headers?.[MESSAGE_HEADERS.RETRY_COUNT] ?? 0);

    this.logger.error(`Event ${eventId} failed (attempt ${attempt + 1}): ${reason}`);

    if (attempt >= NOTIFICATION_MAX_RETRIES) {
      await this.deadLetter(channel, message, `max retries exceeded: ${reason}`);
      return;
    }

    const delay = NOTIFICATION_RETRY_DELAYS_MS[attempt];

    try {
      await this.rabbitMQService.publishRaw(
        '', 
        notificationRetryQueue(delay),
        message.content,
        {
          headers: {
            ...this.cleanHeaders(message),
            [MESSAGE_HEADERS.RETRY_COUNT]: attempt + 1,
            [MESSAGE_HEADERS.LAST_ERROR]: reason,
          },
        },
      );
      channel.ack(message); 
    } catch {
      channel.nack(message, false, true);
    }
  }

  private async deadLetter(channel: Channel, message: ConsumeMessage, reason: string) {
    try {
      await this.rabbitMQService.publishRaw(
        NOTIFICATION_DLX,
        ROUTING_KEYS.VERIFICATION_CODE_ISSUED,
        message.content,
        {
          headers: {
            ...this.cleanHeaders(message),
            [MESSAGE_HEADERS.FAILURE_REASON]: reason,
            [MESSAGE_HEADERS.FAILED_AT]: new Date().toISOString(),
          },
        },
      );
      channel.ack(message);
    } catch {
      channel.nack(message, false, false);
    }
  }

  private cleanHeaders(message: ConsumeMessage): Record<string, unknown> {
    const { ['x-death']: _xDeath, ...rest } = message.properties.headers ?? {};
    return rest;
  }

  private describe(err: unknown): string {
    const e = err as { name?: string; code?: string } | undefined;
    return [e?.name ?? 'Error', e?.code].filter(Boolean).join(':');
  }
}