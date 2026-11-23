import { OtpService } from "../../../../../../libs/auth/otp/otp.service";
import { ClientProxy } from "@nestjs/microservices";
import { of, throwError } from "rxjs";
import { UsersService } from "../../users/users.service";
import { ForgetPasswordUseCase } from "./forget-password.use-case";

describe("ForgetPasswordUseCase", () => {
  const usersService = { findByEmail: jest.fn() };
  const otpService = { create: jest.fn() };
  const eventBus = { emit: jest.fn() };
  const useCase = new ForgetPasswordUseCase(
    usersService as unknown as UsersService,
    otpService as unknown as OtpService,
    eventBus as unknown as ClientProxy,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    eventBus.emit.mockReturnValue(of(undefined));
  });

  it("publishes the generated OTP for an existing account", async () => {
    usersService.findByEmail.mockResolvedValue({
      id: "user-id",
      email: "traveler@example.com",
    });
    otpService.create.mockResolvedValue("123456");

    await expect(useCase.execute("traveler@example.com")).resolves.toEqual({
      success: true,
    });
    expect(usersService.findByEmail).toHaveBeenCalledWith(
      "traveler@example.com",
    );
    expect(otpService.create).toHaveBeenCalledWith(
      "user-id",
      "forgot-password",
    );
    expect(eventBus.emit).toHaveBeenCalledWith(
      "verification-code-issued",
      expect.objectContaining({
        type: "verification-code-issued",
        producer: "identity",
        payload: expect.objectContaining({
          email: "traveler@example.com",
          code: "123456",
          purpose: "password-reset",
        }),
      }),
    );
    const event = eventBus.emit.mock.calls[0][1];
    expect(new Date(event.payload.expiresAt).getTime()).toBeGreaterThan(
      Date.now(),
    );
  });

  it("returns the same success response for an unknown account", async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute("unknown@example.com")).resolves.toEqual({
      success: true,
    });
    expect(otpService.create).not.toHaveBeenCalled();
    expect(eventBus.emit).not.toHaveBeenCalled();
  });

  it("surfaces OTP creation failures", async () => {
    usersService.findByEmail.mockResolvedValue({ id: "user-id" });
    otpService.create.mockRejectedValue(new Error("Redis unavailable"));

    await expect(useCase.execute("traveler@example.com")).rejects.toThrow(
      "Redis unavailable",
    );
    expect(eventBus.emit).not.toHaveBeenCalled();
  });

  it("surfaces event publication failures", async () => {
    usersService.findByEmail.mockResolvedValue({
      id: "user-id",
      email: "traveler@example.com",
    });
    otpService.create.mockResolvedValue("123456");
    eventBus.emit.mockReturnValue(
      throwError(() => new Error("RabbitMQ unavailable")),
    );

    await expect(useCase.execute("traveler@example.com")).rejects.toThrow(
      "RabbitMQ unavailable",
    );
  });
});
