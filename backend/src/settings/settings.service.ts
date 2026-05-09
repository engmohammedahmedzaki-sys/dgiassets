import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './settings.entity';

const INTEGRATION_FIELDS = [
  'moyasarSecretKey', 'moyasarPublishableKey', 'moyasarEnabled',
  'googleClientId', 'googleClientSecret', 'googleAuthEnabled',
  'smtpHost', 'smtpPort', 'smtpUser', 'smtpPass', 'smtpFrom', 'smtpEnabled',
  'openaiApiKey', 'openaiModel', 'openaiEnabled',
] as const;

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(Settings)
    private settingsRepository: Repository<Settings>,
  ) {}

  async onModuleInit() {
    const count = await this.settingsRepository.count();
    if (count === 0) {
      const defaultSettings = this.settingsRepository.create({
        siteName: 'DGI Assets - الأصول الرقمية',
        siteDescription: 'أول سوق عربى متخصص لبيع وشراء الأصول الرقمية الموثّقة',
        footerText: '© 2026 DGI Assets - الأصول الرقمية. جميع الحقوق محفوظة.',
        metaTitle: 'DGI Assets - منصة الأصول الرقمية | بيع وشراء الأصول الرقمية',
        metaDescription: 'منصة DGI Assets - أول سوق عربى متخصص لبيع وشراء الأصول الرقمية الموثّقة: مواقع، تطبيقات، متاجر، دومينات، حسابات، SaaS، مع ضمان كامل ونظام Escrow.',
        metaKeywords: 'أصول رقمية, بيع مشاريع, شراء مواقع, دومينات, متاجر إلكترونية, SaaS, DGI Assets',
      });
      await this.settingsRepository.save(defaultSettings);
    }
  }

  async getSettings(): Promise<Settings | null> {
    return this.settingsRepository.findOne({ where: { id: 1 } });
  }

  async getPublicSettings(): Promise<Partial<Settings> | null> {
    const settings = await this.getSettings();
    if (!settings) return null;
    const copy: any = { ...settings };
    for (const f of INTEGRATION_FIELDS) delete copy[f];
    return copy;
  }

  async getIntegrations(): Promise<Record<string, any>> {
    const settings = await this.getSettings();
    if (!settings) return {};
    return {
      moyasarEnabled: settings.moyasarEnabled,
      moyasarPublishableKey: settings.moyasarPublishableKey,
      moyasarSecretKey: this.maskKey(settings.moyasarSecretKey),
      hasMoyasarSecretKey: !!settings.moyasarSecretKey,

      googleAuthEnabled: settings.googleAuthEnabled,
      googleClientId: settings.googleClientId,
      googleClientSecret: this.maskKey(settings.googleClientSecret),
      hasGoogleClientSecret: !!settings.googleClientSecret,

      smtpEnabled: settings.smtpEnabled,
      smtpHost: settings.smtpHost,
      smtpPort: settings.smtpPort,
      smtpUser: settings.smtpUser,
      smtpPass: this.maskKey(settings.smtpPass),
      hasSmtpPass: !!settings.smtpPass,
      smtpFrom: settings.smtpFrom,

      openaiEnabled: settings.openaiEnabled,
      openaiModel: settings.openaiModel ?? 'gpt-4o-mini',
      openaiApiKey: this.maskKey(settings.openaiApiKey),
      hasOpenaiApiKey: !!settings.openaiApiKey,
    };
  }

  async updateIntegrations(data: Partial<Settings>): Promise<Record<string, any>> {
    const clean: Partial<Settings> = {};
    for (const key of INTEGRATION_FIELDS) {
      if (key in data) {
        const v = (data as any)[key];
        if (v === '' || v === null) {
          if (key.includes('Key') || key.includes('Secret') || key === 'smtpPass' || key === 'openaiApiKey') continue;
          (clean as any)[key] = null;
        } else {
          (clean as any)[key] = v;
        }
      }
    }
    await this.settingsRepository.update(1, clean);
    return this.getIntegrations();
  }

  async updateSettings(updateData: Partial<Settings>): Promise<Settings | null> {
    const clean: Partial<Settings> = { ...updateData };
    for (const f of INTEGRATION_FIELDS) delete (clean as any)[f];
    await this.settingsRepository.update(1, clean);
    return this.getSettings();
  }

  private maskKey(key: string | null | undefined): string {
    if (!key) return '';
    if (key.length <= 8) return '********';
    return key.slice(0, 4) + '****' + key.slice(-4);
  }
}
