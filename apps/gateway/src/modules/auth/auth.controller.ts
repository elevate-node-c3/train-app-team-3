import {
    Controller,
    Post,
    Body,
    Inject,
    OnModuleInit,
    ForbiddenException,
    UnauthorizedException,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';
import { SignUpDto } from './dtos/signup.dto';
import { Authenticated } from '../../common/decorators/authenticated.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GatewayUser } from '../../common/guards/gateway-auth.guard';

interface IdentityGrpcService {
    register(data: SignUpDto): Observable<{
        id: string;
        email: string;
        accessToken: string;
    }>;
    login(data: LoginDto): Observable<{
        id: string;
        email: string;
        accessToken: string;
    }>;
    logout(data: { userId: string; sessionId: string }): Observable<{ success: boolean }>;
    forgotPassword(data: { email: string; userId: string }): Observable<never>;
    verifyOtp(data: { email: string; otp: string; userId: string }): Observable<never>;
}

class LoginDto {
    email!: string;
    password!: string;
    deviceInfo?: string;
}

class ForgotPasswordDto {
    email!: string;
}

class VerifyOtpDto {
    email!: string;
    otp!: string;
}

@Controller('auth')
export class AuthController implements OnModuleInit {
    private identityService: IdentityGrpcService;

    constructor(@Inject('IDENTITY_PACKAGE') private readonly client: ClientGrpc) { }

    onModuleInit() {
        this.identityService = this.client.getService<IdentityGrpcService>('IdentityService');
    }

    @Post('signup')
    async signup(@Body() dto: SignUpDto) {
        const stream$ = this.identityService.register(dto);
        return await lastValueFrom(stream$);
    }

    @Post('login')
    @Authenticated()
    async login(@Body() dto: LoginDto) {
        return lastValueFrom(this.identityService.login(dto));
    }

    @Post('logout')
    @Authenticated()
    async logout(@CurrentUser() user: GatewayUser) {
        if (!user.sid) {
            throw new UnauthorizedException('The access token does not include a session');
        }
        return lastValueFrom(
            this.identityService.logout({ userId: user.sub, sessionId: user.sid }),
        );
    }

    @Post('forgot-password')
    @Authenticated()
    async forgotPassword(@Body() dto: ForgotPasswordDto, @CurrentUser() user: GatewayUser) {
        if (dto.email !== user.email) {
            throw new ForbiddenException('You can only reset the password for your own account');
        }
        return lastValueFrom(
            this.identityService.forgotPassword({ email: user.email, userId: user.sub }),
        );
    }

    @Post('verify-otp')
    @Authenticated()
    async verifyOtp(@Body() dto: VerifyOtpDto, @CurrentUser() user: GatewayUser) {
        if (dto.email !== user.email) {
            throw new ForbiddenException('You can only verify your own account');
        }
        return lastValueFrom(
            this.identityService.verifyOtp({ ...dto, email: user.email, userId: user.sub }),
        );
    }
}