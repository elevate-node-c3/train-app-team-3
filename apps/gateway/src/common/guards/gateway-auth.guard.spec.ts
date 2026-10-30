import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ClientGrpc } from "@nestjs/microservices";
import { of } from "rxjs";
import { GatewayAuthGuard } from "./gateway-auth.guard";

describe("GatewayAuthGuard", () => {
  const jwtService = {
    verifyAsync: jest.fn(),
  };
  const identityService = {
    validateSession: jest.fn(),
  };
  const identityClient = {
    getService: jest.fn().mockReturnValue(identityService),
  };
  const configService = {
    getOrThrow: jest.fn().mockReturnValue("access-secret"),
  };
  const guard = new GatewayAuthGuard(
    jwtService as unknown as JwtService,
    configService as unknown as ConfigService,
    identityClient as unknown as ClientGrpc,
  );

  const contextFor = (authorization?: string) => {
    const request: { headers: { authorization?: string }; user?: unknown } = {
      headers: { authorization },
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as ExecutionContext;
    return { context, request };
  };

  beforeAll(() => guard.onModuleInit());

  beforeEach(() => {
    jest.clearAllMocks();
    identityClient.getService.mockReturnValue(identityService);
    jwtService.verifyAsync.mockResolvedValue({
      sub: "user-id",
      email: "user@example.com",
      sid: "session-id",
    });
    identityService.validateSession.mockReturnValue(of({ active: true }));
  });

  it("rejects requests without a bearer token", async () => {
    const { context } = contextFor();
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it("injects the user only after validating the token and active session", async () => {
    const { context, request } = contextFor("Bearer access-token");
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({
      sub: "user-id",
      email: "user@example.com",
      sid: "session-id",
    });
    expect(identityService.validateSession).toHaveBeenCalledWith({
      userId: "user-id",
      sessionId: "session-id",
    });
  });

  it("rejects a token whose session has been revoked", async () => {
    identityService.validateSession.mockReturnValue(of({ active: false }));
    const { context } = contextFor("Bearer access-token");
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
