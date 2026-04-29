import { Controller, Get, Patch, Delete, Param, Body, UseGuards, Request, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: any) {
    const user = await this.usersService.findOne(req.user.id);
    if (!user) throw new BadRequestException('المستخدم غير موجود');
    const { password, emailVerificationCode, ...rest } = user as any;
    return rest;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @Request() req: any,
    @Body() body: { fullName?: string; phoneNumber?: string; whatsappNumber?: string },
  ) {
    const allowed: any = {};
    if (body.fullName !== undefined) allowed.fullName = body.fullName;
    if (body.phoneNumber !== undefined) allowed.phoneNumber = body.phoneNumber;
    if (body.whatsappNumber !== undefined) allowed.whatsappNumber = body.whatsappNumber;
    await this.usersService.update(req.user.id, allowed);
    const user = await this.usersService.findOne(req.user.id);
    const { password, emailVerificationCode, ...rest } = user as any;
    return rest;
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Request() req: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    if (!body.newPassword || body.newPassword.length < 6) {
      throw new BadRequestException('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
    }
    const user = await this.usersService.findOne(req.user.id);
    if (!user) throw new BadRequestException('المستخدم غير موجود');

    if (user.password) {
      const valid = await bcrypt.compare(body.currentPassword, user.password);
      if (!valid) throw new UnauthorizedException('كلمة المرور الحالية غير صحيحة');
    }
    const hashed = await bcrypt.hash(body.newPassword, 10);
    await this.usersService.update(req.user.id, { password: hashed } as any);
    return { success: true, message: 'تم تغيير كلمة المرور بنجاح' };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateUserRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.update(id, { role });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteUser(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { success: true };
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async toggleUserStatus(@Param('id') id: string) {
    return this.usersService.toggleStatus(id);
  }

  @Patch('make-me-admin')
  @UseGuards(JwtAuthGuard)
  async makeMeAdmin(@Request() req: any) {
    const user = await this.usersService.findOne(req.user.id);
    if (user) {
      user.role = UserRole.ADMIN;
      await this.usersService.update(user.id, user);
      return { success: true, message: 'أنت الآن مدير النظام' };
    }
    return { success: false };
  }
}
