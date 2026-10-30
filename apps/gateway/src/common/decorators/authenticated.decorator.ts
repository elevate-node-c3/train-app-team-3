import { applyDecorators, UseGuards } from '@nestjs/common';
import { GatewayAuthGuard } from '../guards/gateway-auth.guard';

export const Authenticated = () => applyDecorators(UseGuards(GatewayAuthGuard));
