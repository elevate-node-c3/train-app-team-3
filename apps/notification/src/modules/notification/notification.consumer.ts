import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, ChannelModel, Channel, ConsumeMessage } from 'amqplib';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class NotificationConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationConsumer.name);
  private connection?: ChannelModel;
  private channel?: Channel;
  private readonly rabbitUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {
    this.rabbitUrl = this.configService.get<string>(
      'notification.rabbitmq.url',
      process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672',
    );
  }

  async onModuleInit() {
    await this.startConsumer();
  }

  private async startConsumer() {
    try {
      this.connection = await connect(this.rabbitUrl);
      this.channel = await this.connection.createChannel();

      const exchange = 'enr.events';
      const queueName = 'notification.verification-code';
      const dlxExchange = 'enr.dlx';
      const dlqName = 'notification.verification-code.dlq';

      // 1. Assert main exchange and DLX
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      await this.channel.assertExchange(dlxExchange, 'direct', { durable: true });

      // 2. Assert DLQ and bind to DLX
      await this.channel.assertQueue(dlqName, { durable: true });
      await this.channel.bindQueue(dlqName, dlxExchange, queueName);

      // 3. Assert consumer queue with dead letter configuration
      await this.channel.assertQueue(queueName, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': dlxExchange,
          'x-dead-letter-routing-key': queueName,
        },
      });

      // 4. Bind queue to routing key
      await this.channel.bindQueue(queueName, exchange, 'traveller.verification-code.issued');
      await this.channel.bindQueue(queueName, exchange, '*.verification-code.issued');

      this.channel.prefetch(10);

      this.channel.consume(queueName, async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          const raw = msg.content.toString();
          const event = JSON.parse(raw);
          const payload = event.payload ?? event;

          await this.processVerificationEmail(payload);
          this.channel?.ack(msg);
        } catch (err: any) {
          this.logger.error(`Failed to process notification message: ${err.message}`, err.stack);
          // Check retry count via x-death header to avoid poison pill loops
          const deathHeader = msg.properties.headers?.['x-death'];
          const deathCount = deathHeader && deathHeader[0] ? deathHeader[0].count : 0;

          if (deathCount >= 3) {
            this.logger.warn(`Max retries reached for message ${msg.properties.messageId}. Dead-lettering.`);
            this.channel?.nack(msg, false, false); // sends to DLQ
          } else {
            this.channel?.nack(msg, false, false); // sends to DLQ or retry
          }
        }
      });

      this.logger.log(`Notification consumer started, listening on queue: ${queueName}`);
    } catch (err: any) {
      this.logger.warn(`RabbitMQ connection failed for notification consumer: ${err.message}. Retrying in 5s...`);
      setTimeout(() => void this.startConsumer(), 5000);
    }
  }

  private async processVerificationEmail(payload: {
    email: string;
    code: string;
    language?: string;
  }) {
    const { email, code, language } = payload;
    const isEn = language === 'en';

    const subject = isEn
      ? 'Egyptian National Railways - Email Verification Code'
      : 'سكك حديد مصر - رمز التحقق من البريد الإلكتروني';

    const html = isEn
      ? `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 500px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0284c7; margin-top: 0;">Egyptian National Railways</h2>
          <p>Welcome! Use the verification code below to verify your email address:</p>
          <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 16px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a;">${code}</span>
          </div>
          <p style="font-size: 14px; color: #64748b;">This code is valid for 10 minutes and single-use only. If you did not request this, please disregard this email.</p>
        </div>
      `
      : `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 500px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; text-align: right;">
          <h2 style="color: #0284c7; margin-top: 0;">سكك حديد مصر (ENR)</h2>
          <p>أهلاً بك! استخدم رمز التحقق التالي لتأكيد بريدك الإلكتروني:</p>
          <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 16px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a;">${code}</span>
          </div>
          <p style="font-size: 14px; color: #64748b;">رمز التحقق صالح لمدة 10 دقائق واستخدام مرة واحدة فقط. إذا لم تطلب هذا الرمز، يُرجى تجاهل هذه الرسالة.</p>
        </div>
      `;

    const text = isEn
      ? `Your ENR verification code is: ${code}. Valid for 10 minutes.`
      : `رمز التحقق الخاص بك في سكك حديد مصر هو: ${code}. صالح لمدة 10 دقائق.`;

    await this.mailerService.send({
      to: email,
      subject,
      html,
      text,
    });
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch {
      // ignore
    }
  }
}
