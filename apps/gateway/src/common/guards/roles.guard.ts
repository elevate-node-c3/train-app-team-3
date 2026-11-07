import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { GatewayUser } from './gateway-auth.guard';
import { I18nContext, I18nService } from 'nestjs-i18n';

export const REQUIRED_ROLES_KEY = 'gateway:required-roles';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly i18n: I18nService,
    ) {}

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
            const language = I18nContext.current()?.lang ?? 'ar';
            throw new ForbiddenException(
                this.i18n.translate('auth.notAuthorized', { lang: language }),
            );
        }

        return true;
    }
}