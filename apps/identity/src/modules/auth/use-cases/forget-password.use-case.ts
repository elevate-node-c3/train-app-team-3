

import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { randomUUID } from "crypto";
import { lastValueFrom } from "rxjs";
import {
  VERIFICATION_CODE_ISSUED_EVENT_KEY,
  type VerificationCodeIssuedEvent,
} from "../../../../../../libs/contracts/src/events.interfaces/verification-code-issued.event";
import {
  OTP_TTL_SECONDS,
  OtpService,
} from "../../../../../../libs/auth/otp/otp.service";
import { UsersService } from "../../users/users.service";

@Injectable()
export class ForgetPasswordUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
    @Inject("RABBITMQ_CLIENT") private readonly eventBus: ClientProxy,
  ) {}

  async execute(email: string): Promise<{ success: boolean }> {
    const user = await this.usersService.findByEmail(email);

    if (user) {
      const code = await this.otpService.create(user.id, "forgot-password");
      const now = new Date();
      const eventId = randomUUID();
      const event: VerificationCodeIssuedEvent = {
        eventId,
        type: VERIFICATION_CODE_ISSUED_EVENT_KEY,
        version: 1,
        occurredAt: now.toISOString(),
        correlationId: eventId,
        producer: "identity",
        payload: {
          email: user.email,
          code,
          purpose: "password-reset",
          expiresAt: new Date(
            now.getTime() + OTP_TTL_SECONDS * 1000,
          ).toISOString(),
        },
      };

      await lastValueFrom(
        this.eventBus.emit(VERIFICATION_CODE_ISSUED_EVENT_KEY, event),
      );
    }

    return { success: true };
  }
}
