import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, EntityManager } from 'typeorm';
import { VerificationCode } from './verification.entity';
import { VerificationPurpose } from '../../../../../libs/contracts/src/verification-code-issued.event';

@Injectable()
export class VerificationRepository {
  constructor(
    @InjectRepository(VerificationCode)
    private readonly repository: Repository<VerificationCode>,
  ) {}

  async invalidateActiveCodes(
    email: string,
    purpose: VerificationPurpose,
    now: Date,
    manager?: EntityManager,
  ): Promise<void> {
    const dbManager = manager ?? this.repository.manager;
    await dbManager.update(
      VerificationCode,
      { email, purpose, usedAt: IsNull() },
      { usedAt: now },
    );
  }

  async saveCode(
    data: {
      userId: string;
      email: string;
      codeHash: string;
      purpose: VerificationPurpose;
      expiresAt: Date;
    },
    manager?: EntityManager,
  ): Promise<VerificationCode> {
    const dbManager = manager ?? this.repository.manager;
    const record = dbManager.create(VerificationCode, {
      ...data,
      usedAt: null,
    });
    return dbManager.save(VerificationCode, record);
  }

  async findActiveCodeForVerification(
    email: string,
    purpose: VerificationPurpose,
    manager?: EntityManager,
  ): Promise<VerificationCode | null> {
    const dbManager = manager ?? this.repository.manager;
    return dbManager.findOne(VerificationCode, {
      where: {
        email,
        purpose,
        usedAt: IsNull(),
      },
      order: { createdAt: 'DESC' },
      lock: { mode: 'pessimistic_write' },
    });
  }

  async markAsUsed(
    record: VerificationCode,
    manager?: EntityManager,
  ): Promise<VerificationCode> {
    const dbManager = manager ?? this.repository.manager;
    record.usedAt = new Date();
    return dbManager.save(VerificationCode, record);
  }
}