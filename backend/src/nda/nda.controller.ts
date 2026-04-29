import {
  Controller,
  Post,
  Get,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { NdaService } from './nda.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('nda')
@UseGuards(JwtAuthGuard)
export class NdaController {
  constructor(private readonly ndaService: NdaService) {}

  @Post('sign/:projectId')
  async sign(@Param('projectId') projectId: string, @Request() req: any) {
    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || null;
    const signature = await this.ndaService.sign(projectId, req.user.id, ipAddress);
    return { success: true, signedAt: signature.signedAt };
  }

  @Get('status/:projectId')
  async status(@Param('projectId') projectId: string, @Request() req: any) {
    const signed = await this.ndaService.hasSigned(projectId, req.user.id);
    return { signed };
  }
}
