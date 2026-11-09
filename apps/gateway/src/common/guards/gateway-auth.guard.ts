import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ClientGrpc } from "@nestjs/microservices";
import { Request } from "express";
import { lastValueFrom } from "rxjs";
import { IdentityGrpcService } from "../../clients/identity/identity-grpc.interface";
import { I18nContext, I18nService } from "nestjs-i18n";

export interface GatewayUser {
  sub: string;
  email: string;
  sid?: string;
  roles?: string[];
}

interface AuthenticatedRequest extends Request {
  user?: GatewayUser;
}

@Injectable()
export class GatewayAuthGuard implements CanActivate, OnModuleInit {
  private readonly accessSecret: string;
  private identityService!: IdentityGrpcService;

  constructor(
    private readonly jwtService: JwtService,
    configService: ConfigService,
    @Inject("IDENTITY_PACKAGE") private readonly identityClient: ClientGrpc,
    private readonly i18n: I18nService,
  ) {
    this.accessSecret = configService.getOrThrow<string>("JWT_ACCESS_SECRET");
  }

  onModuleInit(): void {
    this.identityService =
      this.identityClient.getService<IdentityGrpcService>("IdentityService");
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const [scheme, token] = authorization?.split(" ") ?? [];

    if (scheme?.toLowerCase() !== "bearer" || !token) {
      throw new UnauthorizedException(this.translate("auth.bearerRequired"));
    }

    let user: GatewayUser;
    try {
      user = await this.jwtService.verifyAsync<GatewayUser>(token, {
        secret: this.accessSecret,
        algorithms: ["HS256"],
      });
    } catch (error) {
      throw new UnauthorizedException(
        this.translate("auth.tokenInvalidOrExpired"),
      );
    }

    if (
      !user ||
      typeof user.sub !== "string" ||
      typeof user.email !== "string" ||
      typeof user.sid !== "string" ||
      (user.roles !== undefined &&
        (!Array.isArray(user.roles) ||
          user.roles.some((role) => typeof role !== "string")))
    ) {
      throw new UnauthorizedException(this.translate("auth.tokenInvalid"));
    }

    const session = await lastValueFrom(
      this.identityService.validateSession({
        userId: user.sub,
        sessionId: user.sid,
      }),
    );
    if (!session.active) {
      throw new UnauthorizedException(this.translate("auth.sessionInactive"));
    }

    request.user = user;
    return true;
  }

  private translate(key: string): string {
    const language = I18nContext.current()?.lang ?? "ar";
    return this.i18n.translate(key, { lang: language });
  }
}
