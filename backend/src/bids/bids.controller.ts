import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BidsService } from './bids.service';
import { Project } from '../projects/project.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsNumber, Min } from 'class-validator';

class PlaceBidDto {
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'قيمة المزايدة غير صالحة' })
  @Min(1, { message: 'قيمة المزايدة غير صالحة' })
  amount: number;
}

@Controller('projects/:projectId/bids')
export class BidsController {
  constructor(
    private readonly bidsService: BidsService,
    @InjectRepository(Project) private projectsRepo: Repository<Project>,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async placeBid(
    @Param('projectId') projectId: string,
    @Body() dto: PlaceBidDto,
    @Request() req: any,
  ) {
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || null;
    const result = await this.bidsService.placeBid(
      projectId,
      req.user.id,
      dto.amount,
      ip,
    );
    return {
      success: true,
      currentHighBid: result.project.currentHighBid,
      bidCount: result.project.bidCount,
      bidId: result.bid.id,
    };
  }

  @Get()
  async list(@Param('projectId') projectId: string) {
    // Trigger lazy finalize so expired auctions wrap up on first read
    const project = await this.projectsRepo.findOne({ where: { id: projectId } });
    if (project) await this.bidsService.finalizeIfExpired(project);

    const bids = await this.bidsService.getBidsForProject(projectId);
    return bids.map((b) => ({
      id: b.id,
      amount: b.amount,
      bidderName: b.bidder?.fullName ?? 'مزايد',
      createdAt: b.createdAt,
    }));
  }
}
