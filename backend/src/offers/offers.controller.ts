import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('offers')
@UseGuards(JwtAuthGuard)
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  create(@Body() createOfferDto: CreateOfferDto, @Request() req: any) {
    return this.offersService.create(createOfferDto, req.user.id);
  }

  @Get()
  findAll(@Request() req: any, @Query('type') type: 'sent' | 'received' = 'sent') {
    return this.offersService.findAll(req.user.id, type);
  }

  @Get('project/:projectId')
  getProjectOffers(@Param('projectId') projectId: string, @Request() req: any) {
    return this.offersService.getProjectOffers(projectId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.offersService.findOne(id, req.user.id);
  }

  @Patch(':id/accept')
  accept(@Param('id') id: string, @Request() req: any) {
    return this.offersService.accept(id, req.user.id);
  }

  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Body('rejectReason') rejectReason: string,
    @Request() req: any,
  ) {
    return this.offersService.reject(id, req.user.id, rejectReason);
  }

  @Patch(':id/counter')
  counter(
    @Param('id') id: string,
    @Body('counterAmount') counterAmount: number,
    @Request() req: any,
  ) {
    return this.offersService.counter(id, req.user.id, counterAmount);
  }

  @Patch(':id/withdraw')
  withdraw(@Param('id') id: string, @Request() req: any) {
    return this.offersService.withdraw(id, req.user.id);
  }
}
