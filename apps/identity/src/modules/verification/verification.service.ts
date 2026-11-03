import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { createHmac, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import {
  VerificationPurpose,
  VerificationCodeIssuedEvent,
} from '../../../../../libs/contracts/src/verification-code-issued.event';
import { OutboxEvent } from '../outbox/outbox.entity';
import { OutboxEncryptionService } from '../outbox/outbox-encryption.service';
import { VerificationRepository } from './verification.repository';

@Injectable()
export class VerificationService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly outboxEncryptionService: OutboxEncryptionService,
    private readonly configService: ConfigService,
    private readonly verificationRepository: VerificationRepository,
  ) {}

  private hashCode(email: string, purpose: VerificationPurpose, code: string): string {
    const secret = this.configService.getOrThrow<string>('OTP_HASH_SECRET');

    return createHmac('sha256', secret)
      .update(`${email.toLowerCase()}:${purpose}:${code}`)
      .digest('hex');
  }

  async issueCode(input: {
    userId: string;
    email: string;
    purpose: VerificationPurpose;
    language?: string;
    correlationId?: string;
  }) {
    const email = input.email.toLowerCase();
    const code = randomInt(100000, 1000000).toString();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
    const eventId = randomUUID();

    const event: VerificationCodeIssuedEvent = {
      eventId,
      type: 'verification-code-issued',
      version: 1,
      occurredAt: now.toISOString(),
      correlationId: input.correlationId ?? randomUUID(),
      producer: 'identity',
      payload: {
        email,
        code,
        language: input.language ?? 'en',
        purpose: input.purpose,
        expiresAt: expiresAt.toISOString(),
      },
    };

    await this.dataSource.transaction(async (manager) => {
      await this.verificationRepository.invalidateActiveCodes(
        email,
        input.purpose,
        now,
        manager,
      );

      await this.verificationRepository.saveCode(
        {
          userId: input.userId,
          email,
          codeHash: this.hashCode(email, input.purpose, code),
          purpose: input.purpose,
          expiresAt,
        },
        manager,
      );

      await manager.save(OutboxEvent, {
        eventId,
        payload: this.outboxEncryptionService.encryptPayload(event),
        sentAt: null,
      });
    });

    return { message: 'Verification code requested successfully' };
  }

  async verifyCode(input: {
    email: string;
    code: string;
    purpose: VerificationPurpose;
  }): Promise<boolean> {
    const email = input.email.toLowerCase();

    return this.dataSource.transaction(async (manager) => {
      const record = await this.verificationRepository.findActiveCodeForVerification(
        email,
        input.purpose,
        manager,
      );

      if (!record || record.expiresAt.getTime() <= Date.now()) {
        return false;
      }

      const expected = Buffer.from(record.codeHash, 'hex');
      const actual = Buffer.from(
        this.hashCode(email, input.purpose, input.code),
        'hex',
      );

      if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
        return false;
      }

      await this.verificationRepository.markAsUsed(record, manager);

      return true;
    });
  }
  
}