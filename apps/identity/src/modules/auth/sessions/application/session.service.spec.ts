import { Session } from "../domain/entities/session.entity";
import { SessionRepository } from "../domain/repository/session.repo";
import { SessionService } from "../session.service";

describe("SessionService", () => {
  const sessionRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    revoke: jest.fn(),
  };
  const service = new SessionService(
    sessionRepository as unknown as SessionRepository,
  );
  const expiresAt = new Date(Date.now() + 60_000);
  const activeSession = new Session(
    "session-id",
    "user-id",
    "browser",
    false,
    expiresAt,
    new Date(),
    new Date(),
  );

  beforeEach(() => {
    jest.clearAllMocks();
    sessionRepository.save.mockImplementation(
      async (session: Session) => session,
    );
    sessionRepository.findById.mockResolvedValue(activeSession);
    sessionRepository.revoke.mockResolvedValue(true);
  });

  it("persists a new session with its identity, device and expiration", async () => {
    const session = await service.create({
      sessionId: "session-id",
      userId: "user-id",
      deviceInfo: "browser",
      expiresAt,
    });

    expect(session).toMatchObject({
      id: "session-id",
      userId: "user-id",
      deviceInfo: "browser",
      revoked: false,
      expiresAt,
    });
    expect(sessionRepository.save).toHaveBeenCalledWith(session);
  });

  it("only returns an active session belonging to the requested user", async () => {
    await expect(service.findActive("session-id", "user-id")).resolves.toBe(
      activeSession,
    );
    await expect(
      service.findActive("session-id", "another-user"),
    ).resolves.toBeNull();

    sessionRepository.findById.mockResolvedValue(null);
    await expect(
      service.findActive("missing-session", "user-id"),
    ).resolves.toBeNull();
  });

  it("revokes active sessions only for the matching owner", async () => {
    await expect(service.revoke("session-id", "user-id")).resolves.toBe(true);
    expect(sessionRepository.revoke).toHaveBeenCalledWith(
      "session-id",
      "user-id",
      expect.any(Date),
    );

    await expect(service.revoke("session-id", "another-user")).resolves.toBe(
      false,
    );
  });
});
