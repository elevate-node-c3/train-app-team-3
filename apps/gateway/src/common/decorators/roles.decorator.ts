import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { GatewayAuthGuard } from '../guards/gateway-auth.guard';
import { REQUIRED_ROLES_KEY } from '../guards/roles.guard';
import { RolesGuard } from '../guards/roles.guard';

export const Roles = (...roles: string[]) =>
    applyDecorators(
        SetMetadata(REQUIRED_ROLES_KEY, roles),
        UseGuards(GatewayAuthGuard, RolesGuard),
    );
