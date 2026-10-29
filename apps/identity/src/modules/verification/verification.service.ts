import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager, IsNull } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomInt, randomUUID, timingSafeEqual } from 'crypto';
import { CacheService } from '@app/cache';
import { ErrorCode } from '@app/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { VerificationCode } from './entities/verification-code.entity';
import { OutboxEvent } from '../outbox/entities/outbox-event.entity';

@Injectable()
export class VerificationService {
    private readonly logger = new Logger(VerificationService.name);
    private readonly otpSecret: string;

    constructor(
        private readonly dataSource: DataSource,
        private readonly configService: ConfigService,
        private readonly cacheService: CacheService,
    ) {
        this.otpSecret = this.configService.get<string>(
            'identity.otp.secret',
            'enr-identity-otp-hash-secret-2026',
        );
    }

    private hashCode(email: string, purpose: string, code: string): string {
        return createHmac('sha256', this.otpSecret)
            .update(`${email.toLowerCase()}:${purpose}:${code}`)
            .digest('hex');
    }

    private throwRpcError(code: string, grpcStatus: number, params?: Record<string, any>): never {
        throw new RpcException({
            code: grpcStatus,
            message: JSON.stringify({ code, params: params || {} }),
        });
    }

    async issueVerificationCode(
        input: {
            userId: string;
            email: string;
            purpose?: string;
            language?: string;
            correlationId?: string;
        },
        externalManager?: EntityManager,
    ): Promise<{ code: string; expiresAt: Date; cooldownSeconds: number }> {
        const email = input.email.trim().toLowerCase();
        const purpose = input.purpose ?? 'email-verification';
        const language = input.language ?? 'ar';

        // 1. Check Resend Cooldown (120 seconds) in Redis
        const cooldownKey = `identity:resend:cooldown:${email}`;
        const cooldownRemaining = await this.cacheService.ttl(cooldownKey);
        if (cooldownRemaining > 0) {
            this.throwRpcError(ErrorCode.RATE_LIMITED, status.RESOURCE_EXHAUSTED, {
                seconds: cooldownRemaining,
            });
        }

        // 2. Check Hourly Limit (maximum 5 codes per hour per email)
        const hourlyKey = `identity:resend:hourly:${email}`;
        const hourlyCountStr = await this.cacheService.get(hourlyKey);
        const hourlyCount = hourlyCountStr ? parseInt(hourlyCountStr, 10) : 0;
        if (hourlyCount >= 5) {
            const hourlyTtl = await this.cacheService.ttl(hourlyKey);
            this.throwRpcError(ErrorCode.AUTH_TOO_MANY_ATTEMPTS, status.RESOURCE_EXHAUSTED, {
                seconds: hourlyTtl > 0 ? hourlyTtl : 3600,
            });
        }

        // 3. Generate 6-digit code and 10 minutes expiry
        const code = randomInt(100000, 1000000).toString();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
        const eventId = randomUUID();
        const codeHash = this.hashCode(email, purpose, code);

        const runInTransaction = async (manager: EntityManager) => {
            // Kill/invalidate previous active codes for this email and purpose
            await manager.update(
                VerificationCode,
                { email, purpose, usedAt: IsNull() },
                { usedAt: now },
            );

            // Save new verification code
            await manager.save(VerificationCode, {
                userId: input.userId,
                email,
                codeHash,
                purpose,
                attempts: 0,
                maxAttempts: 5,
                expiresAt,
                usedAt: null,
            });

            // Save outbox event for asynchronous notification via RabbitMQ
            await manager.save(OutboxEvent, {
                eventId,
                eventType: 'traveller.verification-code.issued',
                aggregateType: 'user',
                aggregateId: input.userId,
                payload: {
                    userId: input.userId,
                    email,
                    code,
                    language,
                    purpose,
                    expiresAt: expiresAt.toISOString(),
                },
                correlationId: input.correlationId,
                status: 'PENDING',
                retryCount: 0,
            });
        };

        if (externalManager) {
            await runInTransaction(externalManager);
        } else {
            await this.dataSource.transaction(runInTransaction);
        }

        // 4. Update Redis rate limit counters
        await this.cacheService.set(cooldownKey, '1', 120);

        const newHourlyCount = await this.cacheService.incr(hourlyKey);
        if (newHourlyCount === 1) {
            await this.cacheService.expire(hourlyKey, 3600);
        }

        // Reset verification attempts on new code issuance
        await this.cacheService.del(`identity:verify:attempts:${email}`);

        return { code, expiresAt, cooldownSeconds: 120 };
    }

    async verifyCode(input: {
        email: string;
        code: string;
        purpose?: string;
    }): Promise<{ userId: string; email: string }> {
        const email = input.email.trim().toLowerCase();
        const purpose = input.purpose ?? 'email-verification';

        // 1. Check Redis failed attempts
        const attemptsKey = `identity:verify:attempts:${email}`;
        const attemptsStr = await this.cacheService.get(attemptsKey);
        const redisAttempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
        if (redisAttempts >= 5) {
            const ttl = await this.cacheService.ttl(attemptsKey);
            this.throwRpcError(ErrorCode.AUTH_TOO_MANY_ATTEMPTS, status.RESOURCE_EXHAUSTED, {
                seconds: ttl > 0 ? ttl : 600,
            });
        }

        return await this.dataSource.transaction(async (manager) => {
            // Pessimistic write lock on active verification record
            const record = await manager.findOne(VerificationCode, {
                where: { email, purpose, usedAt: IsNull() },
                order: { createdAt: 'DESC' },
                lock: { mode: 'pessimistic_write' },
            });

            if (!record) {
                await this.recordFailedAttempt(email);
                this.throwRpcError(ErrorCode.AUTH_CODE_INVALID, status.INVALID_ARGUMENT);
            }

            if (record.expiresAt.getTime() <= Date.now()) {
                await this.recordFailedAttempt(email);
                this.throwRpcError(ErrorCode.AUTH_CODE_EXPIRED, status.INVALID_ARGUMENT);
            }

            if (record.attempts >= record.maxAttempts) {
                record.usedAt = new Date();
                await manager.save(record);
                this.throwRpcError(ErrorCode.AUTH_TOO_MANY_ATTEMPTS, status.RESOURCE_EXHAUSTED, {
                    seconds: 600,
                });
            }

            // Timing-safe comparison of code hashes
            const expectedHash = Buffer.from(record.codeHash, 'hex');
            const actualHash = Buffer.from(this.hashCode(email, purpose, input.code.trim()), 'hex');

            const isMatch =
                expectedHash.length === actualHash.length &&
                timingSafeEqual(expectedHash, actualHash);

            if (!isMatch) {
                record.attempts += 1;
                const newAttempts = await this.recordFailedAttempt(email);

                if (record.attempts >= record.maxAttempts || newAttempts >= 5) {
                    record.usedAt = new Date(); // kill the code
                    await manager.save(record);
                    this.throwRpcError(ErrorCode.AUTH_TOO_MANY_ATTEMPTS, status.RESOURCE_EXHAUSTED, {
                        seconds: 600,
                    });
                }

                await manager.save(record);
                this.throwRpcError(ErrorCode.AUTH_CODE_INVALID, status.INVALID_ARGUMENT);
            }

            // Success: mark single-use code as used
            record.usedAt = new Date();
            await manager.save(record);

            // Clear attempts counter
            await this.cacheService.del(attemptsKey);

            return { userId: record.userId, email };
        });
    }

    private async recordFailedAttempt(email: string): Promise<number> {
        const attemptsKey = `identity:verify:attempts:${email}`;
        const count = await this.cacheService.incr(attemptsKey);
        if (count === 1) {
            await this.cacheService.expire(attemptsKey, 600); // 10 minutes window
        }
        return count ?? 1;
    }
}
