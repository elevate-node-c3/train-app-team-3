import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { TokenService } from "../../../../../../libs/auth/token/jwt.services";
import { TokenType } from "../../../../../../libs/auth/token/token.interfaces";
import { CacheService } from "../../../../../../libs/cache/src";
import { SessionService } from "../sessions/session.service";

export interface CreateSessionInput {
  userId: string;
  email: string;
  deviceInfo?: string | null;
}

@Injectable()
export class CreateSessionUseCase {
  constructor(
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly cacheService: CacheService,
  ) {}

  async execute(input: CreateSessionInput): Promise<{ accessToken: string }> {
    const sessionId = randomUUID();
    const signedAccessToken = await this.tokenService.sign(
      {
        sub: input.userId,
        email: input.email,
        sid: sessionId,
      },
      TokenType.ACCESS,
    );
    const signedRefreshToken = await this.tokenService.sign(
      {
        sub: input.userId,
        email: input.email,
        sid: sessionId,
      },
      TokenType.REFRESH,
    );

    await this.sessionService.create({
      sessionId,
      userId: input.userId,
      deviceInfo: input.deviceInfo ?? null,
      expiresAt: signedRefreshToken.expiresAt,
    });

    const ttlSeconds = Math.max(
      1,
      Math.ceil((signedRefreshToken.expiresAt.getTime() - Date.now()) / 1000),
    );
    await this.cacheService.set(
      `auth:session:${input.userId}:${sessionId}`,
      JSON.stringify({
        userId: input.userId,
        email: input.email,
        sid: sessionId,
        expiresAt: signedRefreshToken.expiresAt.toISOString(),
      }),
      ttlSeconds,
    );
    await this.cacheService.set(
      `auth:token:${sessionId}`,
      signedAccessToken.token,
      ttlSeconds,
    );

    return { accessToken: signedAccessToken.token };
  }
}
