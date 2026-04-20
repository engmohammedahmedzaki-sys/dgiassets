import { Controller, Get, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

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
