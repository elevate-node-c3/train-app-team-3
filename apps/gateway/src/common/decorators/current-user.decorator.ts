import {
    createParamDecorator,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { Request } from 'express';
import type { GatewayUser } from '../guards/gateway-auth.guard';

interface AuthenticatedRequest extends Request {
    user?: GatewayUser;
}

export const CurrentUser = createParamDecorator(
    (_data: unknown, context: ExecutionContext): GatewayUser => {
        const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user;
        if (!user) {
            throw new UnauthorizedException(
                I18nContext.current()?.translate('auth.userUnavailable') ??
                    'بيانات المستخدم المصادق عليه غير متاحة',
            );
        }
        return user;
    },
);