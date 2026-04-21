import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Settings } from './settings.entity';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings() {
    return this.settingsService.getPublicSettings();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateSettings(@Body() updateData: Partial<Settings>) {
    return this.settingsService.updateSettings(updateData);
  }

  @Get('integrations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getIntegrations() {
    return this.settingsService.getIntegrations();
  }

  @Patch('integrations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateIntegrations(@Body() data: Partial<Settings>) {
    return this.settingsService.updateIntegrations(data);
  }
}
