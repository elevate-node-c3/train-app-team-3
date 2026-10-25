import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_ROUTE_KEY = 'gateway:is-public';

export const Public = () => SetMetadata(IS_PUBLIC_ROUTE_KEY, true);