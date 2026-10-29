import { of } from 'rxjs';
import { AuthController } from './auth.controller';
import { ClientGrpc } from '@nestjs/microservices';

describe('Gateway AuthController', () => {
  let controller: AuthController;
  let mockIdentityService: any;
  let mockClient: any;

  beforeEach(() => {
    mockIdentityService = {
      signUp: jest.fn().mockReturnValue(
        of({
          userId: 'usr-1',
          email: 'traveller@example.com',
          maskedEmail: 't***r@example.com',
          message: 'Account created',
        }),
      ),
      verifyEmail: jest.fn().mockReturnValue(
        of({
          userId: 'usr-1',
          email: 'traveller@example.com',
          isVerified: true,
          accessToken: 'jwt-access-token',
          refreshToken: 'refresh-token-secret',
        }),
      ),
      resendVerificationCode: jest.fn().mockReturnValue(
        of({
          message: 'Verification code resent',
          maskedEmail: 't***r@example.com',
          cooldownSeconds: 120,
        }),
      ),
    };

    mockClient = {
      getService: jest.fn().mockReturnValue(mockIdentityService),
    };

    controller = new AuthController(mockClient as ClientGrpc);
    controller.onModuleInit();
  });

  it('should call signUp on identity service and return standardized created envelope', async () => {
    const mockReq = {
      envelopeContext: {
        correlationId: 'req-corr-1',
        language: 'ar',
      },
    } as any;

    const response = await controller.signup(
      {
        email: 'traveller@example.com',
        password: 'Password123!',
        passwordConfirmation: 'Password123!',
      },
      mockReq,
    );

    expect(response.success).toBe(true);
    expect(response.data.maskedEmail).toBe('t***r@example.com');
    expect(response.meta.correlationId).toBe('req-corr-1');
    expect(mockIdentityService.signUp).toHaveBeenCalledTimes(1);
  });

  it('should call verifyEmail on identity service and return session tokens in envelope', async () => {
    const mockReq = {
      envelopeContext: {
        correlationId: 'req-corr-2',
        language: 'en',
      },
    } as any;

    const response = await controller.verify(
      {
        email: 'traveller@example.com',
        code: '123456',
      },
      mockReq,
    );

    expect(response.success).toBe(true);
    expect(response.data.accessToken).toBe('jwt-access-token');
    expect(response.data.isVerified).toBe(true);
    expect(mockIdentityService.verifyEmail).toHaveBeenCalledTimes(1);
  });

  it('should call resendVerificationCode and return cooldown', async () => {
    const mockReq = {
      envelopeContext: {
        correlationId: 'req-corr-3',
        language: 'ar',
      },
    } as any;

    const response = await controller.resendCode(
      {
        email: 'traveller@example.com',
      },
      mockReq,
    );

    expect(response.success).toBe(true);
    expect(response.data.cooldownSeconds).toBe(120);
    expect(mockIdentityService.resendVerificationCode).toHaveBeenCalledTimes(1);
  });
});
