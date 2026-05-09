import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from './bid.entity';
import { Project, ListingType, ProjectStatus } from '../projects/project.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid) private bidsRepo: Repository<Bid>,
    @InjectRepository(Project) private projectsRepo: Repository<Project>,
    private notificationsService: NotificationsService,
  ) {}

  async placeBid(
    projectId: string,
    bidderId: string,
    amount: number,
    ipAddress: string | null,
  ): Promise<{ bid: Bid; project: Project }> {
    const project = await this.projectsRepo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('المشروع غير موجود');

    if (project.listingType !== ListingType.AUCTION) {
      throw new BadRequestException('هذا المشروع ليس مزاداً');
    }
    if (project.status !== ProjectStatus.ACTIVE) {
      throw new BadRequestException('المزاد غير متاح حالياً');
    }
    if (project.ownerId === bidderId) {
      throw new ForbiddenException('لا يمكنك المزايدة على مشروعك');
    }

    // Auto-finalize if expired
    if (project.auctionEndsAt && new Date(project.auctionEndsAt).getTime() <= Date.now()) {
      await this.finalizeAuction(project);
      throw new BadRequestException('انتهى وقت المزاد');
    }

    if (project.auctionFinalized) {
      throw new BadRequestException('المزاد منتهى');
    }

    const bidAmount = Number(amount);
    if (!bidAmount || bidAmount <= 0) {
      throw new BadRequestException('قيمة المزايدة غير صالحة');
    }

    const minBid = Number(project.minBid ?? 0);
    const currentHigh = Number(project.currentHighBid ?? 0);

    if (currentHigh > 0) {
      if (bidAmount <= currentHigh) {
        throw new BadRequestException(
          `يجب أن تكون المزايدة أكبر من ${currentHigh.toLocaleString('ar-EG')} ر.س`,
        );
      }
    } else if (minBid > 0 && bidAmount < minBid) {
      throw new BadRequestException(
        `الحد الأدنى للمزايدة ${minBid.toLocaleString('ar-EG')} ر.س`,
      );
    }

    // Capture previous high bidder before update for outbid notification
    const previousBidderId = project.currentHighBidderId;
    const previousAmount = currentHigh;

    // Save the new bid
    const bid = this.bidsRepo.create({
      projectId,
      bidderId,
      amount: bidAmount,
      ipAddress,
    });
    const savedBid = await this.bidsRepo.save(bid);

    // Update project's denormalized high bid
    project.currentHighBid = bidAmount;
    project.currentHighBidderId = bidderId;
    project.bidCount = (project.bidCount ?? 0) + 1;
    await this.projectsRepo.save(project);

    // Fire notifications (non-blocking)
    this.notificationsService
      .create(
        project.ownerId,
        NotificationType.SYSTEM,
        '🔨 مزايدة جديدة على مشروعك',
        `تلقّيت مزايدة بقيمة ${bidAmount.toLocaleString('ar-EG')} ر.س على "${project.title}".`,
        { projectId, bidId: savedBid.id, amount: bidAmount },
      )
      .catch(() => {});

    if (previousBidderId && previousBidderId !== bidderId) {
      this.notificationsService
        .create(
          previousBidderId,
          NotificationType.SYSTEM,
          '⚠️ تمّ تخطّى مزايدتك',
          `حد آخر زايد بأعلى منك على "${project.title}". مزايدتك السابقة: ${previousAmount.toLocaleString('ar-EG')} ر.س.`,
          { projectId, newAmount: bidAmount },
        )
        .catch(() => {});
    }

    return { bid: savedBid, project };
  }

  async getBidsForProject(projectId: string): Promise<Bid[]> {
    return this.bidsRepo.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  /**
   * Lazy finalizer — called when reading a project or placing a bid.
   * Marks auctionFinalized=true if the deadline has passed and notifies seller + winner.
   */
  async finalizeIfExpired(project: Project): Promise<Project> {
    if (
      project.listingType !== ListingType.AUCTION ||
      project.auctionFinalized ||
      !project.auctionEndsAt ||
      new Date(project.auctionEndsAt).getTime() > Date.now()
    ) {
      return project;
    }
    return this.finalizeAuction(project);
  }

  private async finalizeAuction(project: Project): Promise<Project> {
    project.auctionFinalized = true;
    const updated = await this.projectsRepo.save(project);

    if (project.currentHighBidderId && project.currentHighBid) {
      const amount = Number(project.currentHighBid).toLocaleString('ar-EG');
      this.notificationsService
        .create(
          project.ownerId,
          NotificationType.SYSTEM,
          '🏁 انتهى مزاد مشروعك',
          `أعلى مزايدة كانت ${amount} ر.س على "${project.title}".`,
          { projectId: project.id, winnerId: project.currentHighBidderId },
        )
        .catch(() => {});

      this.notificationsService
        .create(
          project.currentHighBidderId,
          NotificationType.SYSTEM,
          '🎉 ربحت المزاد!',
          `كنت الفائز فى مزاد "${project.title}" بقيمة ${amount} ر.س. تواصل مع البائع لإكمال الصفقة.`,
          { projectId: project.id, amount: project.currentHighBid },
        )
        .catch(() => {});
    } else {
      this.notificationsService
        .create(
          project.ownerId,
          NotificationType.SYSTEM,
          '🏁 انتهى مزاد مشروعك',
          `لم تتلقَّ أى مزايدات على "${project.title}". يمكنك إعادة نشر المشروع.`,
          { projectId: project.id },
        )
        .catch(() => {});
    }

    return updated;
  }
}
