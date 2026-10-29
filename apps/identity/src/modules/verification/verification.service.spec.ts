import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { VerificationService } from './verification.service';
import { CacheService } from '@app/cache';

describe('VerificationService', () => {
    let service: VerificationService;
    let mockDataSource: any;
    let mockConfigService: any;
    let mockCacheService: any;
    let mockManager: any;

    beforeEach(() => {
        mockManager = {
            update: jest.fn().mockResolvedValue({ affected: 1 }),
            save: jest.fn().mockResolvedValue({}),
            findOne: jest.fn(),
        };

        mockDataSource = {
            transaction: jest.fn(async (cb) => cb(mockManager)),
        };

        mockConfigService = {
            get: jest.fn().mockReturnValue('test-otp-secret-key-1234567890'),
        };

        mockCacheService = {
            ttl: jest.fn().mockResolvedValue(-2),
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue('OK'),
            incr: jest.fn().mockResolvedValue(1),
            expire: jest.fn().mockResolvedValue(1),
            del: jest.fn().mockResolvedValue(1),
        };

        service = new VerificationService(
            mockDataSource as DataSource,
            mockConfigService as ConfigService,
            mockCacheService as unknown as CacheService,
        );
    });

    it('should enforce 120-second resend cooldown', async () => {
        mockCacheService.ttl.mockResolvedValue(85); // 85 seconds remaining

        await expect(
            service.issueVerificationCode({
                userId: 'user-1',
                email: 'test@example.com',
            }),
        ).rejects.toThrow();
    });

    it('should enforce maximum 5 codes per hour per email', async () => {
        mockCacheService.ttl.mockResolvedValue(-2);
        mockCacheService.get.mockResolvedValue('5'); // 5 already issued

        await expect(
            service.issueVerificationCode({
                userId: 'user-1',
                email: 'test@example.com',
            }),
        ).rejects.toThrow();
    });

    it('should issue 6-digit code, invalidate old codes, and record outbox event in transaction', async () => {
        mockCacheService.ttl.mockResolvedValue(-2);
        mockCacheService.get.mockResolvedValue('0');

        const result = await service.issueVerificationCode({
            userId: 'user-1',
            email: 'test@example.com',
            language: 'ar',
        });

        expect(result.code).toHaveLength(6);
        expect(result.cooldownSeconds).toBe(120);
        expect(mockManager.update).toHaveBeenCalledTimes(1); // invalidates previous codes
        expect(mockManager.save).toHaveBeenCalledTimes(2); // saves code and outbox event
        expect(mockCacheService.set).toHaveBeenCalledWith(
            'identity:resend:cooldown:test@example.com',
            '1',
            120,
        );
    });

    it('should reject when code is wrong and increment failed attempts', async () => {
        const mockCodeRecord = {
            id: 'code-1',
            userId: 'user-1',
            email: 'test@example.com',
            // hash of '000000'
            codeHash: (service as any).hashCode('test@example.com', 'email-verification', '000000'),
            expiresAt: new Date(Date.now() + 500000),
            attempts: 0,
            maxAttempts: 5,
        };

        mockManager.findOne.mockResolvedValue(mockCodeRecord);

        await expect(
            service.verifyCode({
                email: 'test@example.com',
                code: '999999',
            }),
        ).rejects.toThrow();

        expect(mockCodeRecord.attempts).toBe(1);
        expect(mockManager.save).toHaveBeenCalledWith(mockCodeRecord);
    });

    it('should kill code after 5 failed attempts', async () => {
        const mockCodeRecord = {
            id: 'code-1',
            userId: 'user-1',
            email: 'test@example.com',
            codeHash: (service as any).hashCode('test@example.com', 'email-verification', '000000'),
            expiresAt: new Date(Date.now() + 500000),
            attempts: 4, // 5th attempt will fail
            maxAttempts: 5,
            usedAt: null,
        };

        mockManager.findOne.mockResolvedValue(mockCodeRecord);

        await expect(
            service.verifyCode({
                email: 'test@example.com',
                code: '999999',
            }),
        ).rejects.toThrow();

        expect((mockCodeRecord as any).usedAt).toBeInstanceOf(Date); // killed
    });
});
