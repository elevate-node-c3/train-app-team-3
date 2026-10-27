import { TokenService } from "../../../../../../libs/auth/token/jwt.services";
import { TokenType } from "../../../../../../libs/auth/token/token.interfaces";
import { SessionService } from "../sessions/session.service";
import { CreateSessionUseCase } from "./create-session.use-case";

describe("CreateSessionUseCase", () => {
  const tokenService = {
    sign: jest.fn(),
  };
  const sessionService = {
    create: jest.fn(),
  };
  const cacheService = {
    set: jest.fn(),
  };
  const useCase = new CreateSessionUseCase(
    tokenService as unknown as TokenService,
    sessionService as unknown as SessionService,
    cacheService as any,
  );
  const expiresAt = new Date("2026-02-01T00:00:00.000Z");

  beforeEach(() => {
    jest.clearAllMocks();
    tokenService.sign.mockResolvedValue({
      token: "signed-access-token",
      jti: "jti",
      expiresAt,
    });
    sessionService.create.mockResolvedValue(undefined);
    cacheService.set.mockResolvedValue("OK");
  });

  it("signs an access token and persists a matching session", async () => {
    await expect(
      useCase.execute({
        userId: "user-id",
        email: "user@example.com",
        deviceInfo: "browser",
      }),
    ).resolves.toEqual({ accessToken: "signed-access-token" });

    const [payload, tokenType] = tokenService.sign.mock.calls[0];
    const [session] = sessionService.create.mock.calls[0];

    expect(payload).toMatchObject({
      sub: "user-id",
      email: "user@example.com",
    });
    expect(typeof payload.sid).toBe("string");
    expect(tokenType).toBe(TokenType.ACCESS);
    expect(session).toEqual({
      sessionId: payload.sid,
      userId: "user-id",
      deviceInfo: "browser",
      expiresAt,
    });
    expect(cacheService.set).toHaveBeenCalledWith(
      expect.stringContaining("auth:session:user-id:"),
      expect.stringContaining('"sid":'),
      expect.any(Number),
    );
  });

  it("does not persist a session if logining the token fails", async () => {
    tokenService.sign.mockRejectedValue(new Error("logining failed"));

    await expect(
      useCase.execute({ userId: "user-id", email: "user@example.com" }),
    ).rejects.toThrow("logining failed");
    expect(sessionService.create).not.toHaveBeenCalled();
  });
});
