import { SessionService } from "../sessions/session.service";
import { LogoutUseCase } from "./logout.use-case";
import { I18nService } from "nestjs-i18n";

describe("LogoutUseCase", () => {
  const sessionService = {
    isActive: jest.fn(),
    revoke: jest.fn(),
  };
  const i18n = {
    translate: jest.fn().mockReturnValue("الجلسة غير نشطة لهذا المستخدم"),
  };
  const useCase = new LogoutUseCase(
    sessionService as unknown as SessionService,
    i18n as unknown as I18nService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    i18n.translate.mockReturnValue("الجلسة غير نشطة لهذا المستخدم");
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
    ).rejects.toThrow("الجلسة غير نشطة لهذا المستخدم");
    expect(sessionService.revoke).toHaveBeenCalledWith(
      "session-id",
      "other-user",
    );
  });
});
