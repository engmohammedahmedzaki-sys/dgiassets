import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DealsService } from './deals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateDealDto } from './dto/create-deal.dto';

@Controller('deals')
@UseGuards(JwtAuthGuard)
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  createDeal(@Body() dto: CreateDealDto, @Request() req: any) {
    return this.dealsService.createFromOffer(dto.offerId, req.user.id);
  }

  @Get()
  getMyDeals(@Request() req: any) {
    return this.dealsService.findMyDeals(req.user.id);
  }

  @Get(':id')
  getDeal(@Param('id') id: string, @Request() req: any) {
    return this.dealsService.findOneForUser(id, req.user.id);
  }

  @Post(':id/confirm-payment')
  confirmPayment(
    @Param('id') dealId: string,
    @Body('moyasarId') moyasarId: string,
    @Request() req: any,
  ) {
    return this.dealsService.confirmPayment(dealId, moyasarId);
  }

  @Patch(':id/start-transfer')
  startTransfer(
    @Param('id') id: string,
    @Body('transferNotes') notes: string,
    @Request() req: any,
  ) {
    return this.dealsService.startTransfer(id, req.user.id, notes);
  }

  @Patch(':id/complete')
  completeDeal(@Param('id') id: string, @Request() req: any) {
    return this.dealsService.completeDeal(id, req.user.id);
  }

  @Patch(':id/dispute')
  openDispute(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req: any,
  ) {
    return this.dealsService.openDispute(id, req.user.id, reason);
  }
}
