import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { AppConfig } from '@app/common';

/**
 * Transport بس: بيبعت لـ SMTP (Mailpit في التطوير). مفيش templates ولا لغات هنا:
 * ده شغلك (BR-56)، والـ consumers هي اللي بتنادي send() بالمحتوى الجاهز.
 */
@Injectable()
export class MailerService {
  private readonly transport: nodemailer.Transporter;
  private readonly from: string;

  constructor(config: AppConfig) {
    this.from = config.get('MAIL_FROM');
    this.transport = nodemailer.createTransport({
      host: config.get('SMTP_HOST'),
      port: config.get<number>('SMTP_PORT'),
      secure: false,
      ignoreTLS: true,
    });
  }

  async send(message: { to: string; subject: string; html: string; text?: string }): Promise<void> {
    await this.transport.sendMail({ from: this.from, ...message });
  }
}
