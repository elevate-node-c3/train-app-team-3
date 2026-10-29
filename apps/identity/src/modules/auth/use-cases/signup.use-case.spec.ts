import { DataSource } from 'typeorm';
import { SignUpUseCase, maskEmail } from './signup.use-case';
import { VerificationService } from '../../verification/verification.service';
import { User } from '../../users/entities/user.entity';

describe('SignUpUseCase', () => {
    let useCase: SignUpUseCase;
    let mockDataSource: any;
    let mockVerificationService: any;
    let mockManager: any;

    beforeEach(() => {
        mockManager = {
            findOne: jest.fn(),
            create: jest.fn((entity, data) => ({ id: 'mock-user-id', ...data })),
            save: jest.fn((entity) => Promise.resolve(entity)),
        };

        mockDataSource = {
            transaction: jest.fn(async (cb) => cb(mockManager)),
        };

        mockVerificationService = {
            issueVerificationCode: jest.fn().mockResolvedValue({
                code: '123456',
                expiresAt: new Date(),
                cooldownSeconds: 120,
            }),
        };

        useCase = new SignUpUseCase(mockDataSource as DataSource, mockVerificationService as VerificationService);
    });

    it('should mask email correctly', () => {
        expect(maskEmail('olivia@untitledui.com')).toBe('o***a@untitledui.com');
        expect(maskEmail('al@enr.gov.eg')).toBe('a***@enr.gov.eg');
    });

    it('should successfully sign up a new traveller with unverified status', async () => {
        mockManager.findOne.mockResolvedValue(null);

        const result = await useCase.execute({
            email: '  Traveller@Example.com  ',
            password: 'StrongP@ssw0rd!',
            language: 'ar',
        });

        expect(result.userId).toBe('mock-user-id');
        expect(result.email).toBe('traveller@example.com');
        expect(result.maskedEmail).toBe('t***r@example.com');
        expect(mockVerificationService.issueVerificationCode).toHaveBeenCalledTimes(1);
    });

    it('should reject password with less than 8 characters', async () => {
        await expect(
            useCase.execute({
                email: 'test@example.com',
                password: 'Sh0rt!',
            }),
        ).rejects.toThrow();
    });

    it('should reject password missing symbols or digits', async () => {
        await expect(
            useCase.execute({
                email: 'test@example.com',
                password: 'LettersOnlyPassword',
            }),
        ).rejects.toThrow();
    });

    it('should refuse sign-up if email is already verified', async () => {
        mockManager.findOne.mockResolvedValue({
            id: 'existing-id',
            email: 'verified@example.com',
            isVerified: true,
        });

        await expect(
            useCase.execute({
                email: 'verified@example.com',
                password: 'StrongP@ssw0rd!',
            }),
        ).rejects.toThrow();
    });

    it('should allow re-signup for unverified email and update password and language', async () => {
        const unverifiedUser = {
            id: 'existing-unverified-id',
            email: 'unverified@example.com',
            isVerified: false,
            passwordHash: 'old-hash',
            language: 'ar',
        };
        mockManager.findOne.mockResolvedValue(unverifiedUser);

        const result = await useCase.execute({
            email: 'unverified@example.com',
            password: 'NewP@ssw0rd2026!',
            language: 'en',
        });

        expect(result.userId).toBe('existing-unverified-id');
        expect(unverifiedUser.language).toBe('en');
        expect(unverifiedUser.passwordHash).not.toBe('old-hash');
        expect(mockVerificationService.issueVerificationCode).toHaveBeenCalledTimes(1);
    });
});
