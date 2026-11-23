import { RmqContext } from "@nestjs/microservices";
import { MailerService } from "./mailer.service";
import { VerificationCodeIssuedConsumer } from "./verification-code-issued.consumer";

describe("VerificationCodeIssuedConsumer", () => {
  const mailer = { send: jest.fn() };
  const channel = { ack: jest.fn() };
  const message = {};
  const context = {
    getChannelRef: () => channel,
    getMessage: () => message,
  };
  const consumer = new VerificationCodeIssuedConsumer(
    mailer as unknown as MailerService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sends the reset code email and acknowledges the event", async () => {
    mailer.send.mockResolvedValue(undefined);

    await consumer.handle(
      {
        eventId: "event-id",
        type: "verification-code-issued",
        version: 1,
        occurredAt: "2026-11-12T12:00:00.000Z",
        correlationId: "correlation-id",
        producer: "identity",
        payload: {
          email: "traveler@example.com",
          code: "123456",
          purpose: "password-reset",
          expiresAt: "2026-11-12T12:05:00.000Z",
        },
      },
      context as unknown as RmqContext,
    );

    expect(mailer.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "traveler@example.com",
        subject: "Your password reset code",
        text: expect.stringContaining("123456"),
      }),
    );
    expect(channel.ack).toHaveBeenCalledWith(message);
  });

  it("does not acknowledge the event when email delivery fails", async () => {
    mailer.send.mockRejectedValue(new Error("SMTP unavailable"));

    await expect(
      consumer.handle(
        {
          eventId: "event-id",
          type: "verification-code-issued",
          version: 1,
          occurredAt: "2026-11-12T12:00:00.000Z",
          correlationId: "correlation-id",
          producer: "identity",
          payload: {
            email: "traveler@example.com",
            code: "123456",
            purpose: "password-reset",
            expiresAt: "2026-11-12T12:05:00.000Z",
          },
        },
        context as unknown as RmqContext,
      ),
    ).rejects.toThrow("SMTP unavailable");
    expect(channel.ack).not.toHaveBeenCalled();
  });
});
