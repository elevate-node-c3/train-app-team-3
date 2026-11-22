import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

interface VerifiedSearchUser {
  sub: string;
  email: string;
  sid: string;
  level: string;
}

interface VerifiedSearchRequest extends Request {
  user?: VerifiedSearchUser;
}

@Injectable()
export class VerifiedSearchGuard implements CanActivate {
  private readonly accessSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
    this.accessSecret = configService.getOrThrow<string>('JWT_ACCESS_SECRET');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<VerifiedSearchRequest>();
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('A bearer access token is required.');
    }

    let user: VerifiedSearchUser;
    try {
      user = await this.jwtService.verifyAsync<VerifiedSearchUser>(token, {
        secret: this.accessSecret,
        algorithms: ['HS256'],
      });
    } catch {
      throw new UnauthorizedException('The access token is invalid or expired.');
    }

    if (
      !user ||
      typeof user.sub !== 'string' ||
      typeof user.email !== 'string' ||
      typeof user.sid !== 'string' ||
      typeof user.level !== 'string'
    ) {
      throw new UnauthorizedException('The access token is invalid.');
    }
    if (user.level !== 'verified') {
      throw new ForbiddenException(
        'A verified traveller account is required to search.',
      );
    }

    request.user = user;
    return true;
  }
}
