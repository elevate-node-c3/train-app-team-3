import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { ErrorCode } from '@app/common';
import { User, UserRole } from '../../users/entities/user.entity';
import { VerificationService } from '../../verification/verification.service';

export interface SignUpInput {
    email: string;
    password: string;
    language?: string;
    correlationId?: string;
}

export function maskEmail(email: string): string {
    const parts = email.split('@');
    if (parts.length !== 2) return '***';
    const [local, domain] = parts;
    const maskedLocal = local.length <= 2
        ? `${local[0]}***`
        : `${local[0]}***${local[local.length - 1]}`;
    return `${maskedLocal}@${domain}`;
}

@Injectable()
export class SignUpUseCase {
    private readonly logger = new Logger(SignUpUseCase.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly verificationService: VerificationService,
    ) { }

    async execute(input: SignUpInput) {
        const email = input.email?.trim().toLowerCase();
        if (!email) {
            throw new RpcException({
                code: status.INVALID_ARGUMENT,
                message: JSON.stringify({ code: ErrorCode.VALIDATION_FAILED, params: { field: 'email' } }),
            });
        }

        const password = input.password;
        // Password rule BR-02: Min 8 characters, letter, digit, symbol
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasDigit = /\d/.test(password);
        const hasSymbol = /[^a-zA-Z0-9]/.test(password);

        if (!password || password.length < 8 || !hasLetter || !hasDigit || !hasSymbol) {
            throw new RpcException({
                code: status.INVALID_ARGUMENT,
                message: JSON.stringify({ code: ErrorCode.VALIDATION_FAILED, params: { field: 'password' } }),
            });
        }

        const language = input.language === 'en' ? 'en' : 'ar';
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        return await this.dataSource.transaction(async (manager) => {
            // Find existing user by normalized email with pessimistic write lock to prevent race condition
            let user = await manager.findOne(User, {
                where: { email },
                lock: { mode: 'pessimistic_write' },
            });

            if (user) {
                // If user is already verified: refuse registration (BR-02, Edge Case B)
                if (user.isVerified) {
                    throw new RpcException({
                        code: status.ALREADY_EXISTS,
                        message: JSON.stringify({ code: ErrorCode.AUTH_EMAIL_TAKEN }),
                    });
                }

                // Edge Case A: Signing up again with an unverified email updates password and language
                user.passwordHash = passwordHash;
                user.language = language;
                await manager.save(user);
            } else {
                // Create unverified account
                user = manager.create(User, {
                    email,
                    passwordHash,
                    language,
                    role: UserRole.USER,
                    isVerified: false,
                });
                await manager.save(user);
            }

            // Issue verification code & record outbox event in the same transaction (Reliability)
            await this.verificationService.issueVerificationCode(
                {
                    userId: user.id,
                    email,
                    language,
                    correlationId: input.correlationId,
                },
                manager,
            );

            return {
                userId: user.id,
                email: user.email,
                maskedEmail: maskEmail(user.email),
                message: 'Account created. Verification code sent to your email.',
            };
        });
    }
}
