import { RpcException } from "@nestjs/microservices";
import { CompleteProfileUseCase } from "./use-cases/complete-profile.use-case";
import { LoginUseCase } from "./use-cases/login.use-case";
import { LogoutUseCase } from "./use-cases/logout.use-case";
import { RegisterUseCase } from "./use-cases/register.use-case";
import { AuthService } from "./auth.service";
import { OtpService } from "../../../../../libs/auth/otp/otp.service";

describe("AuthService gRPC response contracts", () => {
  const registerUseCase = { execute: jest.fn() };
  const loginUseCase = { execute: jest.fn() };
  const logoutUseCase = { execute: jest.fn(), isActive: jest.fn() };
  const otpService = { create: jest.fn(), verifyUserOtp: jest.fn() };
  const completeProfileUseCase = { execute: jest.fn() };
  const service = new AuthService(
    registerUseCase as unknown as RegisterUseCase,
    loginUseCase as unknown as LoginUseCase,
    logoutUseCase as unknown as LogoutUseCase,
    otpService as unknown as OtpService,
    completeProfileUseCase as unknown as CompleteProfileUseCase,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the use-case RegisterResponse", async () => {
    const response = {
      id: "user-id",
      email: "traveler@example.com",
      accessToken: "access-token",
    };
    registerUseCase.execute.mockResolvedValue(response);

    await expect(
      service.register({ email: response.email, password: "secret" }),
    ).resolves.toEqual(response);
  });

  it("returns the use-case LoginResponse", async () => {
    const response = {
      id: "user-id",
      email: "traveler@example.com",
      accessToken: "access-token",
    };
    loginUseCase.execute.mockResolvedValue(response);

    await expect(
      service.login({ email: response.email, password: "secret" }),
    ).resolves.toEqual(response);
  });

  it("returns OperationResponse when logout succeeds", async () => {
    logoutUseCase.execute.mockResolvedValue({ success: true });

    await expect(
      service.logout({ userId: "user-id", sessionId: "session-id" }),
    ).resolves.toEqual({ success: true });
  });

  it("returns SessionStatusResponse for session validation", async () => {
    logoutUseCase.isActive.mockResolvedValue(false);

    await expect(
      service.validateSession({ userId: "user-id", sessionId: "session-id" }),
    ).resolves.toEqual({ active: false });
  });

  it("returns OperationResponse after creating a password-reset OTP", async () => {
    otpService.create.mockResolvedValue("123456");

    await expect(
      service.forgotPassword({
        email: "traveler@example.com",
        userId: "user-id",
      }),
    ).resolves.toEqual({ success: true });
    expect(otpService.create).toHaveBeenCalledWith(
      "user-id",
      "forgot-password",
    );
  });

  it("returns OperationResponse for a valid OTP", async () => {
    otpService.verifyUserOtp.mockResolvedValue(true);

    await expect(
      service.verifyOtp({
        email: "traveler@example.com",
        otp: "123456",
        userId: "user-id",
      }),
    ).resolves.toEqual({ success: true });
  });

  it("rejects an invalid OTP instead of returning success", async () => {
    otpService.verifyUserOtp.mockResolvedValue(false);

    await expect(
      service.verifyOtp({
        email: "traveler@example.com",
        otp: "000000",
        userId: "user-id",
      }),
    ).rejects.toBeInstanceOf(RpcException);
  });

  it("returns the use-case CompleteProfileResponse", async () => {
    const response = {
      id: "user-id",
      email: "traveler@example.com",
      isProfileCompleted: true,
      accessToken: "access-token",
    };
    completeProfileUseCase.execute.mockResolvedValue(response);

    await expect(
      service.completeProfile({
        email: response.email,
        fullName: "Traveler Name",
        nationalId: "national-id",
        phone: "+123456789",
        profileType: "traveler",
        nationality: "Example",
      }),
    ).resolves.toEqual(response);
  });
});
