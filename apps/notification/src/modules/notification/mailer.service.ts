import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'localhost',
      port: parseInt(process.env.MAIL_PORT || '1025', 10),
      secure: false,
    });
  }

  async sendVerificationEmail(data: { to: string; code: string; language: string }) {
    const { to, code, language } = data;
    
    const subject = language === 'ar' ? 'رمز التحقق الخاص بك' : 'Your Verification Code';
    const text = language === 'ar' 
      ? `رمز التحقق الخاص بك هو: ${code}` 
      : `Your verification code is: ${code}`;

    await this.transporter.sendMail({
      from: '"Train App" <noreply@trainapp.com>',
      to,
      subject,
      text,
    });

    this.logger.log(`Mail sent successfully to ${to} via Mailpit`);
  }
}