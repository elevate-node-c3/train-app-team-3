import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly transport: nodemailer.Transporter;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    this.from = this.configService.get<string>('MAIL_FROM', 'no-reply@example.com');
    this.transport = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'localhost'),
      port: this.configService.get<number>('SMTP_PORT', 1025),
      secure: false,
      ignoreTLS: true,
    });
  }

  async send(message: { to: string; subject: string; html: string; text?: string }): Promise<void> {
    await this.transport.sendMail({ from: this.from, ...message });
  }
}
