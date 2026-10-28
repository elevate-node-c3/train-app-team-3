
import { Injectable } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import { createHmac, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import {
  VerificationPurpose,
  VerificationCodeIssuedEvent,
} from '../../../../../libs/contracts/src/verification-code-issued.event';
import { VerificationCode } from './verification.entity';
import { encryptPayload, OutboxEvent } from '../outbox/ outbox.entity';

@Injectable()
export class VerificationService {
  constructor(private readonly dataSource: DataSource) {}

  private hashCode(email: string, purpose: VerificationPurpose, code: string): string {
    const secret = process.env.OTP_HASH_SECRET;
    if (!secret) throw new Error('OTP_HASH_SECRET is required');

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
      await manager.update(
        VerificationCode,
        { email, purpose: input.purpose, usedAt: IsNull() },
        { usedAt: now },
      );

      await manager.save(VerificationCode, {
        userId: input.userId,
        email,
        codeHash: this.hashCode(email, input.purpose, code),
        purpose: input.purpose,
        expiresAt,
        usedAt: null,
      });

      await manager.save(OutboxEvent, {
        eventId,
        payload: encryptPayload(event),
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
      const record = await manager.findOne(VerificationCode, {
        where: {
          email,
          purpose: input.purpose,
          usedAt: IsNull(),
        },
        order: { createdAt: 'DESC' },
        lock: { mode: 'pessimistic_write' },
      });

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

      record.usedAt = new Date();
      await manager.save(record);

      return true;
    });
  }
}
