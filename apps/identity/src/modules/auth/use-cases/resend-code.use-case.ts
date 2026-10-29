import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { ErrorCode } from '@app/common';
import { User } from '../../users/entities/user.entity';
import { VerificationService } from '../../verification/verification.service';
import { maskEmail } from './signup.use-case';

export interface ResendCodeInput {
    email: string;
    language?: string;
    correlationId?: string;
}

@Injectable()
export class ResendCodeUseCase {
    private readonly logger = new Logger(ResendCodeUseCase.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly verificationService: VerificationService,
    ) { }

    async execute(input: ResendCodeInput) {
        const email = input.email?.trim().toLowerCase();
        if (!email) {
            throw new RpcException({
                code: status.INVALID_ARGUMENT,
                message: JSON.stringify({ code: ErrorCode.VALIDATION_FAILED, params: { field: 'email' } }),
            });
        }

        const user = await this.dataSource.getRepository(User).findOne({ where: { email } });
        if (!user) {
            throw new RpcException({
                code: status.NOT_FOUND,
                message: JSON.stringify({ code: ErrorCode.NOT_FOUND }),
            });
        }

        if (user.isVerified) {
            throw new RpcException({
                code: status.ALREADY_EXISTS,
                message: JSON.stringify({ code: ErrorCode.AUTH_EMAIL_TAKEN }),
            });
        }

        const result = await this.verificationService.issueVerificationCode({
            userId: user.id,
            email: user.email,
            language: input.language ?? user.language,
            correlationId: input.correlationId,
        });

        return {
            message: 'Verification code resent successfully',
            maskedEmail: maskEmail(user.email),
            cooldownSeconds: result.cooldownSeconds,
        };
    }
}
