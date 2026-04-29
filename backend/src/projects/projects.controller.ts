import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, UseGuards, Optional } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectCategory, ProjectStatus } from './project.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NdaService } from '../nda/nda.service';
import { JwtService } from '@nestjs/jwt';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly ndaService: NdaService,
    private readonly jwtService: JwtService,
  ) {}

  // Try to extract user from optional Bearer token without forcing auth
  private extractUserId(req: any): string | null {
    try {
      const authHeader = req.headers?.authorization;
      if (!authHeader?.startsWith('Bearer ')) return null;
      const token = authHeader.slice(7);
      const payload: any = this.jwtService.verify(token);
      return payload?.sub || null;
    } catch {
      return null;
    }
  }

  // Strip sensitive fields if NDA required and not signed
  private maskSensitiveFields(project: any) {
    const masked = { ...project };
    masked.website = null;
    masked.demoUrl = null;
    masked.monthlyRevenue = null;
    masked.monthlyProfit = null;
    masked.monthlyVisitors = null;
    masked.activeUsers = null;
    masked._ndaRequired = true;
    return masked;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createProjectDto: CreateProjectDto, @Request() req: any) {
    const ownerId = req.user.id;
    return this.projectsService.create(createProjectDto, ownerId);
  }

  @Get()
  findAll(
    @Query('category') category?: ProjectCategory,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('search') search?: string,
    @Query('status') status?: ProjectStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.projectsService.findAll({
      category,
      minPrice,
      maxPrice,
      search,
      status,
      page,
      limit,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const project: any = await this.projectsService.findOne(id);
    if (!project?.requiresNda) return project;

    const userId = this.extractUserId(req);
    // Owner always sees full data
    if (userId && userId === project.ownerId) return project;
    // Signed users see full data
    if (userId) {
      const signed = await this.ndaService.hasSigned(id, userId);
      if (signed) return project;
    }
    return this.maskSensitiveFields(project);
  }

  @Get('owner/my-projects')
  @UseGuards(JwtAuthGuard)
  findMyProjects(@Request() req: any) {
    return this.projectsService.findByOwner(req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req: any,
  ) {
    const ownerId = req.user.id;
    return this.projectsService.update(id, updateProjectDto, ownerId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req: any) {
    const ownerId = req.user.id;
    return this.projectsService.remove(id, ownerId);
  }
}
