import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, createHash } from 'crypto';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { ErrorCode } from '@app/common';
import { User } from '../../users/entities/user.entity';
import { Session } from '../entities/session.entity';
import { VerificationService } from '../../verification/verification.service';

export interface VerifyEmailInput {
    email: string;
    code: string;
}

@Injectable()
export class VerifyEmailUseCase {
    private readonly logger = new Logger(VerifyEmailUseCase.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly verificationService: VerificationService,
        private readonly jwtService: JwtService,
    ) { }

    async execute(input: VerifyEmailInput) {
        const email = input.email?.trim().toLowerCase();
        const code = input.code?.trim();

        if (!email || !code || code.length !== 6) {
            throw new RpcException({
                code: status.INVALID_ARGUMENT,
                message: JSON.stringify({ code: ErrorCode.AUTH_CODE_INVALID }),
            });
        }

        // 1. Verify code, enforce attempt limits, and mark code as used
        const { userId } = await this.verificationService.verifyCode({
            email,
            code,
            purpose: 'email-verification',
        });

        // 2. Mark account as verified and issue session in database
        return await this.dataSource.transaction(async (manager) => {
            const user = await manager.findOne(User, {
                where: { id: userId },
                lock: { mode: 'pessimistic_write' },
            });

            if (!user) {
                throw new RpcException({
                    code: status.NOT_FOUND,
                    message: JSON.stringify({ code: ErrorCode.NOT_FOUND }),
                });
            }

            user.isVerified = true;
            user.verifiedAt = new Date();
            await manager.save(user);

            // Generate short-lived access token (<= 15 minutes, BR-06)
            const accessToken = this.jwtService.sign(
                {
                    sub: user.id,
                    email: user.email,
                    role: user.role,
                },
                { expiresIn: '15m' },
            );

            // Generate rotating refresh token (30 days, BR-06)
            const rawRefreshToken = randomBytes(40).toString('hex');
            const refreshTokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');
            const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            const session = manager.create(Session, {
                userId: user.id,
                refreshTokenHash,
                expiresAt: sessionExpiresAt,
            });
            await manager.save(session);

            return {
                userId: user.id,
                email: user.email,
                isVerified: true,
                accessToken,
                refreshToken: rawRefreshToken,
            };
        });
    }
}
