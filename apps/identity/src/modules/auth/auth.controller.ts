import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

interface GrpcSignUpRequest {
    email: string;
    password: string;
    language?: string;
}

interface GrpcVerifyEmailRequest {
    email: string;
    code: string;
}

interface GrpcResendRequest {
    email: string;
    language?: string;
}

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @GrpcMethod('IdentityService', 'SignUp')
    async signUp(data: GrpcSignUpRequest) {
        return this.authService.signUp(data);
    }

    @GrpcMethod('IdentityService', 'VerifyEmail')
    async verifyEmail(data: GrpcVerifyEmailRequest) {
        return this.authService.verifyEmail(data);
    }

    @GrpcMethod('IdentityService', 'ResendVerificationCode')
    async resendVerificationCode(data: GrpcResendRequest) {
        return this.authService.resendVerificationCode(data);
    }

    @GrpcMethod('IdentityService', 'Register')
    async register(data: RegisterDto) {
        return this.authService.register(data);
    }

    @GrpcMethod('IdentityService', 'Login')
    async login(data: LoginDto) {
        return this.authService.login(data);
    }
}