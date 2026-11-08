import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController gRPC contract", () => {
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

    await expect(controller.register(request)).resolves.toEqual(response);
    expect(authService.register).toHaveBeenCalledWith(request);
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

    await expect(controller.login(request)).resolves.toEqual(response);
    expect(authService.login).toHaveBeenCalledWith(request);
  });

  it("returns OperationResponse for Logout", async () => {
    const request = { userId: "user-id", sessionId: "session-id" };
    authService.logout.mockResolvedValue({ success: true });

    await expect(controller.logout(request)).resolves.toEqual({
      success: true,
    });
    expect(authService.logout).toHaveBeenCalledWith(request);
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

    await expect(controller.verifyOtp(request)).resolves.toEqual({
      success: true,
    });
    expect(authService.verifyOtp).toHaveBeenCalledWith(request);
  });

  it("returns CompleteProfileResponse", async () => {
    const request = {
      email: "traveler@example.com",
      fullName: "Traveler Name",
      nationalId: "national-id",
      phone: "+123456789",
      profileType: "traveler",
      nationality: "Example",
    };
    const response = {
      id: "user-id",
      email: request.email,
      isProfileCompleted: true,
      accessToken: "access-token",
    };
    authService.completeProfile.mockResolvedValue(response);

    await expect(controller.completeProfile(request)).resolves.toEqual(
      response,
    );
    expect(authService.completeProfile).toHaveBeenCalledWith(request);
  });
});
