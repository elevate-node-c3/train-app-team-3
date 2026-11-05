import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ROUTING_KEYS, VerificationCodeIssuedEvent } from '@app/contracts';
import { ProcessedEvent } from '../../database/entities/processed-event.entity';
import { MailerService } from './mailer.service';

@Controller()
export class NotificationConsumer {
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(
    @InjectRepository(ProcessedEvent)
    private readonly processedEventRepo: Repository<ProcessedEvent>,
    private readonly mailerService: MailerService,
  ) {}

  @EventPattern(ROUTING_KEYS.VERIFICATION_CODE_ISSUED)
  async handleVerificationCodeIssued(
    @Payload() event: VerificationCodeIssuedEvent,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    if (!this.isValidEvent(event)) {
      this.logger.error('Invalid event shape received, routing to DLQ');
      channel.nack(originalMessage, false, false);
      return;
    }

    const { eventId, payload } = event;
    const { email, code, language, expiresAt } = payload;

    try {
      const existing = await this.processedEventRepo.findOne({ where: { eventId } });
      if (existing) {
        channel.ack(originalMessage);
        return;
      }

      const expiryTime = new Date(expiresAt).getTime();
      if (Number.isNaN(expiryTime) || Date.now() > expiryTime) {
        this.logger.warn(`Skipping expired code for event ${eventId}`);
        await this.markProcessed(eventId);
        channel.ack(originalMessage);
        return;
      }

      await this.mailerService.sendVerificationEmail({ to: email, code, language });

      await this.markProcessed(eventId);
      channel.ack(originalMessage);
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(`Failed to process event ${eventId}: ${error.message}`);

      const requeue = !originalMessage.fields.redelivered;
      channel.nack(originalMessage, false, requeue);
    }
  }

  private async markProcessed(eventId: string): Promise<void> {
    try {
      await this.processedEventRepo.insert({ eventId });
    } catch (err) {
      if (this.isUniqueViolation(err)) return;
      throw err;
    }
  }

  private isUniqueViolation(err: unknown): boolean {
    const e = err as { code?: string; driverError?: { code?: string } };
    return e?.code === '23505' || e?.driverError?.code === '23505';
  }

  private isValidEvent(event: unknown): event is VerificationCodeIssuedEvent {
    const e = event as Partial<VerificationCodeIssuedEvent> | undefined;
    return (
      !!e &&
      typeof e.eventId === 'string' &&
      !!e.payload &&
      typeof e.payload.email === 'string' &&
      typeof e.payload.code === 'string' &&
      typeof e.payload.expiresAt === 'string'
    );
  }
}