import { Controller, Post, Body, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';
import { SignUpDto } from './dtos/signup.dto';

interface IdentityGrpcService {
    register(data: SignUpDto): Observable<{
        id: string;
        email: string;
        accessToken: string;
    }>;
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
}