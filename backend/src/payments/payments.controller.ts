import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('deal/:dealId')
  @UseGuards(JwtAuthGuard)
  getPaymentByDeal(@Param('dealId') dealId: string) {
    return this.paymentsService.getPaymentByDeal(dealId);
  }

  @Get('verify/:moyasarId')
  @UseGuards(JwtAuthGuard)
  verifyPayment(@Param('moyasarId') moyasarId: string) {
    return this.paymentsService.verifyPayment(moyasarId);
  }

  @Post('webhook')
  handleWebhook(@Body() body: any) {
    return this.paymentsService.handleWebhook(body);
  }
}
