import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { VerifyEmailUseCase } from './verify-email.use-case';
import { VerificationService } from '../../verification/verification.service';

describe('VerifyEmailUseCase', () => {
    let useCase: VerifyEmailUseCase;
    let mockDataSource: any;
    let mockVerificationService: any;
    let mockJwtService: any;
    let mockManager: any;

    beforeEach(() => {
        mockManager = {
            findOne: jest.fn(),
            create: jest.fn((entity, data) => ({ id: 'session-id', ...data })),
            save: jest.fn((entity) => Promise.resolve(entity)),
        };

        mockDataSource = {
            transaction: jest.fn(async (cb) => cb(mockManager)),
        };

        mockVerificationService = {
            verifyCode: jest.fn().mockResolvedValue({ userId: 'user-123' }),
        };

        mockJwtService = {
            sign: jest.fn().mockReturnValue('mocked.jwt.access.token'),
        };

        useCase = new VerifyEmailUseCase(
            mockDataSource as DataSource,
            mockVerificationService as VerificationService,
            mockJwtService as JwtService,
        );
    });

    it('should successfully verify user email and issue session tokens', async () => {
        const user = {
            id: 'user-123',
            email: 'test@example.com',
            isVerified: false,
            role: 'USER',
        };
        mockManager.findOne.mockResolvedValue(user);

        const result = await useCase.execute({
            email: '  test@example.com  ',
            code: '123456',
        });

        expect(result.userId).toBe('user-123');
        expect(result.isVerified).toBe(true);
        expect(result.accessToken).toBe('mocked.jwt.access.token');
        expect(result.refreshToken).toBeDefined();
        expect(user.isVerified).toBe(true);
        expect((user as any).verifiedAt).toBeInstanceOf(Date);
        expect(mockManager.save).toHaveBeenCalledTimes(2); // user and session
    });

    it('should reject invalid code length', async () => {
        await expect(
            useCase.execute({
                email: 'test@example.com',
                code: '12',
            }),
        ).rejects.toThrow();
    });
});
