import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private configService: ConfigService,
    private settingsService: SettingsService,
  ) {}

  private async getTransporter(): Promise<{
    transporter: nodemailer.Transporter | null;
    from: string;
  }> {
    const settings = await this.settingsService.getSettings();
    const fromEnv = this.configService.get<string>('SMTP_FROM');

    if (settings?.smtpEnabled && settings.smtpHost && settings.smtpUser) {
      const port = settings.smtpPort ?? 587;
      return {
        transporter: nodemailer.createTransport({
          host: settings.smtpHost,
          port,
          secure: port === 465,
          auth: { user: settings.smtpUser, pass: settings.smtpPass ?? '' },
        }),
        from: settings.smtpFrom ?? settings.smtpUser,
      };
    }

    const envHost = this.configService.get<string>('SMTP_HOST');
    if (envHost) {
      const port = this.configService.get<number>('SMTP_PORT', 587);
      return {
        transporter: nodemailer.createTransport({
          host: envHost,
          port,
          secure: port === 465,
          auth: {
            user: this.configService.get<string>('SMTP_USER') ?? '',
            pass: this.configService.get<string>('SMTP_PASS') ?? '',
          },
        }),
        from: fromEnv ?? 'noreply@dgiassets.com',
      };
    }

    return { transporter: null, from: fromEnv ?? 'noreply@dgiassets.com' };
  }

  async sendVerificationCode(email: string, code: string, name: string): Promise<void> {
    const { transporter, from } = await this.getTransporter();
    if (!transporter) {
      this.logger.warn(`[DEV/UNSET] OTP for ${email}: ${code}`);
      return;
    }

    await transporter.sendMail({
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
    const { transporter, from } = await this.getTransporter();
    if (!transporter) {
      this.logger.warn(`[DEV/UNSET] Email to ${email}: ${subject}`);
      return;
    }

    await transporter.sendMail({
      from: `"DGI Assets" <${from}>`,
      to: email,
      subject,
      html: `<div dir="rtl" style="font-family: Arial, sans-serif;">${body}</div>`,
    });
  }
}
