import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly transport: nodemailer.Transporter;
  private readonly from: string;

  constructor(config: ConfigService) {
    this.from = config.get<string>('notification.mail.from') ?? config.get<string>('MAIL_FROM') ?? 'noreply@enr.gov.eg';
    const host = config.get<string>('notification.smtp.host') ?? config.get<string>('SMTP_HOST') ?? 'localhost';
    const port = Number(config.get<number>('notification.smtp.port') ?? config.get<number>('SMTP_PORT')) || 1025;

    this.transport = nodemailer.createTransport({
      host,
      port,
      secure: false,
      ignoreTLS: true,
    });
  }

  async send(message: { to: string; subject: string; html: string; text?: string }): Promise<void> {
    try {
      await this.transport.sendMail({ from: this.from, ...message });
      this.logger.log(`Email successfully sent to [${message.to}]: ${message.subject}`);
    } catch (err: any) {
      this.logger.error(`Failed to send email to [${message.to}]: ${err.message}`, err.stack);
      throw err;
    }
  }
}
