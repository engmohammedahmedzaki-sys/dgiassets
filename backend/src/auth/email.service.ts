import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.configService.get<number>('SMTP_PORT', 587),
        secure: this.configService.get<number>('SMTP_PORT', 587) === 465,
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });
    }
  }

  async sendVerificationCode(email: string, code: string, name: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`[DEV] OTP for ${email}: ${code}`);
      return;
    }

    const from = this.configService.get<string>('SMTP_FROM', 'noreply@dgiassets.com');

    await this.transporter.sendMail({
      from: `"منصة DGI Assets" <${from}>`,
      to: email,
      subject: 'كود تفعيل حسابك في DGI Assets',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6c63ff;">مرحباً ${name}!</h2>
          <p>شكراً لتسجيلك في منصة <strong>DGI Assets</strong>.</p>
          <p>كود تفعيل حسابك هو:</p>
          <div style="background: #f0f0ff; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #6c63ff;">${code}</span>
          </div>
          <p style="color: #666;">هذا الكود صالح لمدة 24 ساعة.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">إذا لم تقم بإنشاء هذا الحساب، يرجى تجاهل هذا البريد.</p>
        </div>
      `,
    });
  }

  async sendNotification(email: string, subject: string, body: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`[DEV] Email to ${email}: ${subject}`);
      return;
    }

    const from = this.configService.get<string>('SMTP_FROM', 'noreply@dgiassets.com');
    await this.transporter.sendMail({
      from: `"DGI Assets" <${from}>`,
      to: email,
      subject,
      html: `<div dir="rtl" style="font-family: Arial, sans-serif;">${body}</div>`,
    });
  }
}
