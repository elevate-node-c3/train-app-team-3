import { SessionService } from "../sessions/session.service";
import { LogoutUseCase } from "./logout.use-case";

describe("LogoutUseCase", () => {
  const sessionService = {
    isActive: jest.fn(),
    revoke: jest.fn(),
  };
  const useCase = new LogoutUseCase(
    sessionService as unknown as SessionService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    sessionService.isActive.mockResolvedValue(true);
    sessionService.revoke.mockResolvedValue(true);
  });

  it("revokes the caller's active session", async () => {
    await expect(
      useCase.execute({ userId: "user-id", sessionId: "session-id" }),
    ).resolves.toEqual({ success: true });
    expect(sessionService.revoke).toHaveBeenCalledWith("session-id", "user-id");
  });

  it("refuses to revoke a session owned by another user", async () => {
    sessionService.revoke.mockResolvedValue(false);
    await expect(
      useCase.execute({ userId: "other-user", sessionId: "session-id" }),
    ).rejects.toThrow("The session is not active for this user");
    expect(sessionService.revoke).toHaveBeenCalledWith(
      "session-id",
      "other-user",
    );
  });
});
