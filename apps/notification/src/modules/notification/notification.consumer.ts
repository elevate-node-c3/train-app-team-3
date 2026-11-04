import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  @EventPattern('verification_code_issued')
  async handleVerificationCodeIssued(
    @Payload() data: { eventId: string; email: string; code: string; language: string; expiresAt: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    const { eventId, email, code, language, expiresAt } = data;

    try {
      const existing = await this.processedEventRepo.findOne({ where: { eventId } });
      if (existing) {
        channel.ack(originalMessage);
        return;
      }

      const now = new Date();
      const expiryDate = new Date(expiresAt);
      if (now > expiryDate) {
        await this.processedEventRepo.save({ eventId });
        channel.ack(originalMessage);
        return;
      }

      await this.mailerService.sendVerificationEmail({
        to: email,
        code,
        language,
      });

      await this.processedEventRepo.save({ eventId });
      channel.ack(originalMessage);
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(`Failed to process event: ${error.message}`);
      channel.nack(originalMessage, false, true);
    }
  }
}