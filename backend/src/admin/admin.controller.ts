import {
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from '../projects/projects.service';
import { ProjectStatus } from '../projects/project.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly projectsService: ProjectsService) {}

  // Check if user is admin
  private checkAdmin(req: any) {
    // TODO: Implement proper role check
    // For now, any authenticated user can access
    // In production, check: if (req.user.role !== 'admin') throw new ForbiddenException();
  }

  @Get('stats')
  async getStats(@Request() req: any) {
    this.checkAdmin(req);

    // Get all projects
    const { projects, total } = await this.projectsService.findAll({});

    // Calculate stats
    const activeProjects = projects.filter(
      (p) => p.status === ProjectStatus.ACTIVE,
    ).length;
    const soldProjects = projects.filter(
      (p) => p.status === ProjectStatus.SOLD,
    ).length;
    const pendingProjects = projects.filter(
      (p) => p.status === ProjectStatus.PENDING,
    ).length;

    const totalRevenue = projects
      .filter((p) => p.status === ProjectStatus.SOLD)
      .reduce((sum, p) => sum + Number(p.price), 0);

    return {
      totalProjects: total,
      totalUsers: 10, // TODO: Get from users service
      totalOffers: 0, // TODO: Get from offers service
      totalRevenue,
      activeProjects,
      soldProjects,
      pendingProjects,
    };
  }

  @Get('projects')
  async getAllProjects(@Request() req: any) {
    this.checkAdmin(req);
    return this.projectsService.findAll({ limit: 1000 });
  }

  @Delete('projects/:id')
  async deleteProject(@Param('id') id: string, @Request() req: any) {
    this.checkAdmin(req);

    // Delete the project (bypass owner check)
    const project = await this.projectsService.findOne(id);
    if (!project) {
      throw new ForbiddenException('Project not found');
    }

    // Use a special admin method or just use regular remove with admin override
    // For now, we'll use the existing remove method
    await this.projectsService.remove(id, project.ownerId);

    return { success: true, message: 'Project deleted successfully' };
  }

  @Patch('projects/:id/approve')
  async approveProject(@Param('id') id: string, @Request() req: any) {
    this.checkAdmin(req);

    const project = await this.projectsService.findOne(id);
    if (!project) {
      throw new ForbiddenException('Project not found');
    }

    // Update status to active
    await this.projectsService.update(
      id,
      { status: ProjectStatus.ACTIVE },
      project.ownerId,
    );

    return { success: true, message: 'Project approved successfully' };
  }

  @Patch('projects/:id/reject')
  async rejectProject(@Param('id') id: string, @Request() req: any) {
    this.checkAdmin(req);

    const project = await this.projectsService.findOne(id);
    if (!project) {
      throw new ForbiddenException('Project not found');
    }

    // Update status to rejected (we need to add this status)
    // For now, we'll just delete it or mark as inactive
    await this.projectsService.remove(id, project.ownerId);

    return { success: true, message: 'Project rejected successfully' };
  }
}
