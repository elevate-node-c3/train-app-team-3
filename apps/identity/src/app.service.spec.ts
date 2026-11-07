import { AuthService } from "./modules/auth/auth.service";
import { IdentityService } from "./app.service";

describe("IdentityService", () => {
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    verifyOtp: jest.fn(),
  };
  const service = new IdentityService(authService as unknown as AuthService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates logout to AuthService", async () => {
    authService.logout.mockResolvedValue({ success: true });
    const input = { userId: "user-id", sessionId: "session-id" };

    await expect(service.logout(input)).resolves.toEqual({ success: true });
    expect(authService.logout).toHaveBeenCalledWith(input, "ar");
  });

  it("delegates forgot password to AuthService", async () => {
    authService.forgotPassword.mockResolvedValue({ success: true });
    const input = { email: "traveler@example.com", userId: "user-id" };

    await expect(service.forgotPassword(input)).resolves.toEqual({
      success: true,
    });
    expect(authService.forgotPassword).toHaveBeenCalledWith(input);
  });

  it("delegates OTP verification and locale to AuthService", async () => {
    authService.verifyOtp.mockResolvedValue({ success: true });
    const input = {
      email: "traveler@example.com",
      otp: "123456",
      userId: "user-id",
    };

    await expect(service.verifyOtp(input, "en")).resolves.toEqual({
      success: true,
    });
    expect(authService.verifyOtp).toHaveBeenCalledWith(input, "en");
  });
});
