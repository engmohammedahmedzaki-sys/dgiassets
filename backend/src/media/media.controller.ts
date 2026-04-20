import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('my-media')
  async getMyMedia(@Request() req: any) {
    return this.mediaService.getUserMedia(req.user.userId);
  }

  @Get('all')
  async getAllMedia(@Request() req: any) {
    // Basic protection: only admins can see all media
    if (req.user.role !== 'admin') {
      return this.mediaService.getUserMedia(req.user.userId);
    }
    return this.mediaService.getAllMedia();
  }

  @Delete(':id')
  async deleteMedia(@Param('id') id: string, @Request() req: any) {
    await this.mediaService.deleteMedia(id, req.user.userId, req.user.role);
    return { success: true };
  }
}
