import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { GatewayUser } from './gateway-auth.guard';

export const REQUIRED_ROLES_KEY = 'gateway:required-roles';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(
            REQUIRED_ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRoles?.length) {
            return true;
        }

        const user = context.switchToHttp().getRequest<{ user?: GatewayUser }>().user;
        if (!user?.roles?.some((role) => requiredRoles.includes(role))) {
            throw new ForbiddenException('You are not authorized to access this resource');
        }

        return true;
    }
}