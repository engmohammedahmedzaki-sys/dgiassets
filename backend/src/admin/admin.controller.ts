import {
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ProjectsService } from '../projects/projects.service';
import { Project, ProjectStatus } from '../projects/project.entity';
import { User } from '../users/user.entity';
import { Offer } from '../offers/offer.entity';
import { Deal, DealStatus } from '../deals/deal.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(Project) private projectsRepo: Repository<Project>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Offer) private offersRepo: Repository<Offer>,
    @InjectRepository(Deal) private dealsRepo: Repository<Deal>,
  ) {}

  @Get('stats')
  async getStats() {
    const [
      totalProjects,
      activeProjects,
      pendingProjects,
      soldProjects,
      totalUsers,
      verifiedUsers,
      totalOffers,
      pendingOffers,
      totalDeals,
      completedDeals,
      totalRevenueRow,
    ] = await Promise.all([
      this.projectsRepo.count(),
      this.projectsRepo.count({ where: { status: ProjectStatus.ACTIVE } }),
      this.projectsRepo.count({ where: { status: ProjectStatus.PENDING } }),
      this.projectsRepo.count({ where: { status: ProjectStatus.SOLD } }),
      this.usersRepo.count(),
      this.usersRepo.count({ where: { kycStatus: 'verified' } }),
      this.offersRepo.count(),
      this.offersRepo.count({ where: { status: 'pending' as any } }),
      this.dealsRepo.count(),
      this.dealsRepo.count({ where: { status: DealStatus.COMPLETED } }),
      this.dealsRepo
        .createQueryBuilder('d')
        .select('COALESCE(SUM(d.finalAmount), 0)', 'sum')
        .where('d.status = :status', { status: DealStatus.COMPLETED })
        .getRawOne<{ sum: string }>(),
    ]);

    const totalRevenue = Number(totalRevenueRow?.sum ?? 0);

    const recentProjects = await this.projectsRepo.find({
      order: { createdAt: 'DESC' },
      take: 5,
      select: ['id', 'title', 'price', 'status', 'createdAt'],
    });

    const recentDeals = await this.dealsRepo.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // Revenue by month for the last 6 months
    const revenueByMonth = await this.dealsRepo
      .createQueryBuilder('d')
      .select("TO_CHAR(d.createdAt, 'YYYY-MM')", 'month')
      .addSelect('COALESCE(SUM(d.finalAmount), 0)', 'revenue')
      .where('d.status = :status', { status: DealStatus.COMPLETED })
      .andWhere("d.createdAt >= NOW() - INTERVAL '6 months'")
      .groupBy("TO_CHAR(d.createdAt, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany<{ month: string; revenue: string }>();

    return {
      totalProjects,
      activeProjects,
      pendingProjects,
      soldProjects,
      totalUsers,
      verifiedUsers,
      totalOffers,
      pendingOffers,
      totalDeals,
      completedDeals,
      totalRevenue,
      recentProjects,
      recentDeals,
      revenueByMonth: revenueByMonth.map((r) => ({
        month: r.month,
        revenue: Number(r.revenue),
      })),
    };
  }

  @Get('projects')
  async getAllProjects() {
    return this.projectsService.findAll({ limit: 1000 });
  }

  @Delete('projects/:id')
  async deleteProject(@Param('id') id: string) {
    const project = await this.projectsService.findOne(id);
    if (!project) throw new NotFoundException('Project not found');
    await this.projectsService.remove(id, project.ownerId);
    return { success: true, message: 'تم حذف المشروع' };
  }

  @Patch('projects/:id/approve')
  async approveProject(@Param('id') id: string) {
    const project = await this.projectsService.findOne(id);
    if (!project) throw new NotFoundException('Project not found');
    await this.projectsService.update(
      id,
      { status: ProjectStatus.ACTIVE },
      project.ownerId,
    );

    // Notify the seller that their project was approved
    this.notificationsService
      .create(
        project.ownerId,
        NotificationType.PROJECT_APPROVED,
        '✅ تمت الموافقة على مشروعك',
        `مشروع "${project.title}" أصبح منشوراً ومتاحاً للمشترين الآن.`,
        { projectId: project.id },
      )
      .catch(() => {});

    return { success: true, message: 'تمت الموافقة على المشروع' };
  }

  @Patch('projects/:id/reject')
  async rejectProject(@Param('id') id: string) {
    const project = await this.projectsService.findOne(id);
    if (!project) throw new NotFoundException('Project not found');

    // Capture details before deletion so the seller knows what was rejected
    const ownerId = project.ownerId;
    const title = project.title;

    await this.projectsService.remove(id, project.ownerId);

    this.notificationsService
      .create(
        ownerId,
        NotificationType.PROJECT_REJECTED,
        '❌ لم تتم الموافقة على مشروعك',
        `مشروع "${title}" تم رفضه. للتفاصيل تواصل مع فريق الدعم.`,
        { projectTitle: title },
      )
      .catch(() => {});

    return { success: true, message: 'تم رفض المشروع' };
  }
}
