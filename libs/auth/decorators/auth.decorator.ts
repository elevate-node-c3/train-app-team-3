import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";

import { AuthenticationGuard } from "../guards/authentication.guard";
import { AuthorizationGuard } from "../guards/authorization.guard";

export const IS_REFRESH_ROUTE_KEY = "isRefreshRoute";
export const IS_OPTIONAL_AUTH_ROUTE_KEY = "isOptionalAuthRoute";
export const REQUIRED_ACCESS_LEVELS_KEY = "requiredAccessLevels";

export enum AccessLevel {
  GUEST = "guest",
  UNVERIFIED = "unverified",
  VERIFIED = "verified",
}

export const AccountAccess = () => {
  return applyDecorators(
    SetMetadata(REQUIRED_ACCESS_LEVELS_KEY, [
      AccessLevel.UNVERIFIED,
      AccessLevel.VERIFIED,
    ]),
    UseGuards(AuthenticationGuard, AuthorizationGuard),
  );
};

export const Verified = () => {
  return applyDecorators(
    SetMetadata(REQUIRED_ACCESS_LEVELS_KEY, [AccessLevel.VERIFIED]),
    UseGuards(AuthenticationGuard, AuthorizationGuard),
  );
};

export const RefreshAuth = () => {
  return applyDecorators(
    SetMetadata(IS_REFRESH_ROUTE_KEY, true),
    UseGuards(AuthenticationGuard),
  );
};

export const OptionalAuth = () => {
  return applyDecorators(
    SetMetadata(IS_OPTIONAL_AUTH_ROUTE_KEY, true),
    UseGuards(AuthenticationGuard),
  );
};
