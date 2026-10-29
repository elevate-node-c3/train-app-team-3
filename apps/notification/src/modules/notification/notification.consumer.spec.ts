import { ConfigService } from '@nestjs/config';
import { NotificationConsumer } from './notification.consumer';
import { MailerService } from '../mailer/mailer.service';

describe('NotificationConsumer', () => {
  let consumer: NotificationConsumer;
  let mockConfigService: any;
  let mockMailerService: any;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn().mockReturnValue('amqp://localhost:5672'),
    };

    mockMailerService = {
      send: jest.fn().mockResolvedValue(undefined),
    };

    consumer = new NotificationConsumer(
      mockConfigService as ConfigService,
      mockMailerService as MailerService,
    );
  });

  it('should format and send email in Arabic when language is ar', async () => {
    await (consumer as any).processVerificationEmail({
      email: 'traveller@example.com',
      code: '849201',
      language: 'ar',
    });

    expect(mockMailerService.send).toHaveBeenCalledTimes(1);
    const sentArgs = mockMailerService.send.mock.calls[0][0];
    expect(sentArgs.to).toBe('traveller@example.com');
    expect(sentArgs.subject).toContain('سكك حديد مصر');
    expect(sentArgs.html).toContain('849201');
    expect(sentArgs.html).toContain('dir="rtl"');
  });

  it('should format and send email in English when language is en', async () => {
    await (consumer as any).processVerificationEmail({
      email: 'traveller@example.com',
      code: '123456',
      language: 'en',
    });

    expect(mockMailerService.send).toHaveBeenCalledTimes(1);
    const sentArgs = mockMailerService.send.mock.calls[0][0];
    expect(sentArgs.to).toBe('traveller@example.com');
    expect(sentArgs.subject).toContain('Egyptian National Railways');
    expect(sentArgs.html).toContain('123456');
  });
});
