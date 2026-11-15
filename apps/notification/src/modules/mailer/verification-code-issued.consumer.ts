import { Controller } from "@nestjs/common";
import {
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
  Transport,
} from "@nestjs/microservices";
import {
  VERIFICATION_CODE_ISSUED_EVENT_KEY,
  type VerificationCodeIssuedEvent,
} from "../../../../../libs/contracts/src/events.interfaces/verification-code-issued.event";
import { MailerService } from "./mailer.service";

@Controller()
export class VerificationCodeIssuedConsumer {
  constructor(private readonly mailer: MailerService) {}

  @EventPattern(VERIFICATION_CODE_ISSUED_EVENT_KEY, Transport.RMQ)
  async handle(
    @Payload() event: VerificationCodeIssuedEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const { email, code, purpose, expiresAt } = event.payload;
    const description =
      purpose === "password-reset" ? "password reset" : "email verification";

    await this.mailer.send({
      to: email,
      subject: `Your ${description} code`,
      text: `Your ${description} code is ${code}. It expires at ${expiresAt}.`,
      html: `<p>Your ${description} code is <strong>${code}</strong>.</p><p>It expires at ${expiresAt}.</p>`,
    });

    const channel = context.getChannelRef();
    channel.ack(context.getMessage());
  }
}
