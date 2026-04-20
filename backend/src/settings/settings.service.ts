import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './settings.entity';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(Settings)
    private settingsRepository: Repository<Settings>,
  ) {}

  async onModuleInit() {
    // Ensure initial settings exist
    const count = await this.settingsRepository.count();
    if (count === 0) {
      const defaultSettings = this.settingsRepository.create({
        siteName: 'منصة المشاريع',
        siteDescription: 'سوق بيع وشراء المشاريع الرقمية',
        footerText: '© 2024 منصة المشاريع. جميع الحقوق محفوظة.',
      });
      await this.settingsRepository.save(defaultSettings);
    }
  }

  async getSettings(): Promise<Settings | null> {
    const settings = await this.settingsRepository.findOne({ where: { id: 1 } });
    return settings;
  }

  async updateSettings(updateData: Partial<Settings>): Promise<Settings | null> {
    await this.settingsRepository.update(1, updateData);
    return this.getSettings();
  }
}
