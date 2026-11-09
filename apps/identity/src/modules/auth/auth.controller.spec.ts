import { Metadata } from "@grpc/grpc-js";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController gRPC contract", () => {
  const metadata = new Metadata();
  metadata.set("accept-language", "en");
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    validateSession: jest.fn(),
    forgotPassword: jest.fn(),
    verifyOtp: jest.fn(),
    completeProfile: jest.fn(),
  };
  const controller = new AuthController(authService as unknown as AuthService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the RegisterResponse contract", async () => {
    const request = { email: "traveler@example.com", password: "secret" };
    const response = {
      id: "user-id",
      email: request.email,
      accessToken: "access-token",
    };
    authService.register.mockResolvedValue(response);

    await expect(controller.register(request, metadata)).resolves.toEqual(response);
    expect(authService.register).toHaveBeenCalledWith(request, "en");
  });

  it("returns the LoginResponse contract", async () => {
    const request = {
      email: "traveler@example.com",
      password: "secret",
      deviceInfo: "browser",
    };
    const response = {
      id: "user-id",
      email: request.email,
      accessToken: "access-token",
    };
    authService.login.mockResolvedValue(response);

    await expect(controller.login(request, metadata)).resolves.toEqual(response);
    expect(authService.login).toHaveBeenCalledWith(request, "en");
  });

  it("returns OperationResponse for Logout", async () => {
    const request = { userId: "user-id", sessionId: "session-id" };
    authService.logout.mockResolvedValue({ success: true });

    await expect(controller.logout(request, metadata)).resolves.toEqual({
      success: true,
    });
    expect(authService.logout).toHaveBeenCalledWith(request, "en");
  });

  it("returns SessionStatusResponse for ValidateSession", async () => {
    const request = { userId: "user-id", sessionId: "session-id" };
    authService.validateSession.mockResolvedValue({ active: true });

    await expect(controller.validateSession(request)).resolves.toEqual({
      active: true,
    });
    expect(authService.validateSession).toHaveBeenCalledWith(request);
  });

  it("returns OperationResponse for ForgotPassword", async () => {
    const request = { email: "traveler@example.com", userId: "user-id" };
    authService.forgotPassword.mockResolvedValue({ success: true });

    await expect(controller.forgotPassword(request)).resolves.toEqual({
      success: true,
    });
    expect(authService.forgotPassword).toHaveBeenCalledWith(request);
  });

  it("returns OperationResponse for VerifyOtp", async () => {
    const request = {
      email: "traveler@example.com",
      otp: "123456",
      userId: "user-id",
    };
    authService.verifyOtp.mockResolvedValue({ success: true });

    await expect(controller.verifyOtp(request, metadata)).resolves.toEqual({
      success: true,
    });
    expect(authService.verifyOtp).toHaveBeenCalledWith(request, "en");
  });

  it("returns CompleteProfileResponse", async () => {
    const request = {
      email: "traveler@example.com",
      fullName: "Traveler Name",
      nationalId: "national-id",
      phone: "+201012345678",
      profileType: "traveler",
      nationality: "Example",
    };
    const response = {
      userId: "user-id",
      fullName: request.fullName,
      egyptianMobileNumber: request.phone,
      nationalId: request.nationalId,
      complete: true,
    };
    authService.completeProfile.mockResolvedValue(response);

    await expect(controller.completeProfile(request)).resolves.toEqual(
      response,
    );
    expect(authService.completeProfile).toHaveBeenCalledWith(request);
  });
});
