import { Injectable } from '@nestjs/common';
import { SignUpUseCase, SignUpInput } from './use-cases/signup.use-case';
import { VerifyEmailUseCase, VerifyEmailInput } from './use-cases/verify-email.use-case';
import { ResendCodeUseCase, ResendCodeInput } from './use-cases/resend-code.use-case';
import { LoginUseCase } from './use-cases/login.use-case';
import { RegisterUseCase } from './use-cases/register.use-case';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly signUpUseCase: SignUpUseCase,
        private readonly verifyEmailUseCase: VerifyEmailUseCase,
        private readonly resendCodeUseCase: ResendCodeUseCase,
        private readonly loginUseCase: LoginUseCase,
        private readonly registerUseCase: RegisterUseCase,
    ) { }

    async signUp(data: SignUpInput) {
        return this.signUpUseCase.execute(data);
    }

    async verifyEmail(data: VerifyEmailInput) {
        return this.verifyEmailUseCase.execute(data);
    }

    async resendVerificationCode(data: ResendCodeInput) {
        return this.resendCodeUseCase.execute(data);
    }

    async register(dto: RegisterDto) {
        return this.registerUseCase.execute(dto);
    }

    async login(dto: LoginDto) {
        return this.loginUseCase.execute(dto);
    }
}