import { Injectable } from "@nestjs/common";
import { status } from "@grpc/grpc-js";
import { RpcException } from "@nestjs/microservices";
import { I18nService } from "nestjs-i18n";
import { SessionService } from "../sessions/session.service";
import { AuthLanguage } from "../../../i18n/grpc-language";

@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly sessionService: SessionService,
    private readonly i18n: I18nService,
  ) {}

  async isActive(input: {
    userId: string;
    sessionId: string;
  }): Promise<boolean> {
    return this.sessionService.isActive(input.sessionId, input.userId);
  }

  async execute(
    input: { userId: string; sessionId: string },
    language: AuthLanguage = "ar",
  ) {
    const revoked = await this.sessionService.revoke(
      input.sessionId,
      input.userId,
    );
    if (!revoked) {
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: this.i18n.translate("auth.sessionNotActive", {
          lang: language,
        }),
      });
    }
    return { success: true };
  }
}
