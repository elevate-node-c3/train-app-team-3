import {
    createParamDecorator,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import type { GatewayUser } from '../guards/gateway-auth.guard';

interface AuthenticatedRequest extends Request {
    user?: GatewayUser;
}

export const CurrentUser = createParamDecorator(
    (_data: unknown, context: ExecutionContext): GatewayUser => {
        const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user;
        if (!user) {
            throw new UnauthorizedException('Authenticated user is unavailable');
        }
        return user;
    },
);