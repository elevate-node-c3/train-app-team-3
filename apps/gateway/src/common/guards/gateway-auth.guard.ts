import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    OnModuleInit,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClientGrpc } from '@nestjs/microservices';
import { Request } from 'express';
import { lastValueFrom, Observable } from 'rxjs';

export interface GatewayUser {
    sub: string;
    email: string;
    sid?: string;
    roles?: string[];
}

interface AuthenticatedRequest extends Request {
    user?: GatewayUser;
}

interface IdentitySessionService {
    validateSession(data: { userId: string; sessionId: string }): Observable<{ active: boolean }>;
}

@Injectable()
export class GatewayAuthGuard implements CanActivate, OnModuleInit {
    private readonly accessSecret: string;
    private identityService!: IdentitySessionService;

    constructor(
        private readonly jwtService: JwtService,
        configService: ConfigService,
        @Inject('IDENTITY_PACKAGE') private readonly identityClient: ClientGrpc,
    ) {
        this.accessSecret = configService.getOrThrow<string>('JWT_ACCESS_SECRET');
    }

    onModuleInit(): void {
        this.identityService =
            this.identityClient.getService<IdentitySessionService>('IdentityService');
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const authorization = request.headers.authorization;
        const [scheme, token] = authorization?.split(' ') ?? [];

        if (scheme?.toLowerCase() !== 'bearer' || !token) {
            throw new UnauthorizedException('A bearer access token is required');
        }

        let user: GatewayUser;
        try {
            user = await this.jwtService.verifyAsync<GatewayUser>(token, {
                secret: this.accessSecret,
                algorithms: ['HS256'],
            });
        } catch (error) {
            throw new UnauthorizedException('The access token is invalid or expired');
        }

        if (
            !user ||
            typeof user.sub !== 'string' ||
            typeof user.email !== 'string' ||
            typeof user.sid !== 'string' ||
            (user.roles !== undefined &&
                (!Array.isArray(user.roles) ||
                    user.roles.some((role) => typeof role !== 'string')))
        ) {
            throw new UnauthorizedException('The access token is invalid');
        }

        const session = await lastValueFrom(
            this.identityService.validateSession({
                userId: user.sub,
                sessionId: user.sid,
            }),
        );
        if (!session.active) {
            throw new UnauthorizedException('The access token session is no longer active');
        }

        request.user = user;
        return true;
    }
}