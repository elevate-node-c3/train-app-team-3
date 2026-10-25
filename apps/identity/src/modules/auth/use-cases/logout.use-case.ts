import { Injectable } from "@nestjs/common";
import { status } from "@grpc/grpc-js";
import { RpcException } from "@nestjs/microservices";
import { SessionService } from "../sessions/session.service";

@Injectable()
export class LogoutUseCase {
  constructor(private readonly sessionService: SessionService) {}

  async isActive(input: {
    userId: string;
    sessionId: string;
  }): Promise<boolean> {
    return this.sessionService.isActive(input.sessionId, input.userId);
  }

  async execute(input: { userId: string; sessionId: string }) {
    const revoked = await this.sessionService.revoke(
      input.sessionId,
      input.userId,
    );
    if (!revoked) {
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: "The session is not active for this user",
      });
    }
    return { success: true };
  }
}
