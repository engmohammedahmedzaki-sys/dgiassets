import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { MediaService } from '../media/media.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly mediaService: MediaService,
  ) {}

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const url = this.uploadService.getFileUrl(file.filename);
    const media = await this.mediaService.saveMedia(file, url, { id: req.user.id } as any);

    return {
      success: true,
      filename: file.filename,
      url,
      size: file.size,
      mimetype: file.mimetype,
      mediaId: media.id,
    };
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[], @Request() req: any) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const url = this.uploadService.getFileUrl(file.filename);
        const media = await this.mediaService.saveMedia(file, url, { id: req.user.id } as any);
        return {
          filename: file.filename,
          url,
          size: file.size,
          mimetype: file.mimetype,
          mediaId: media.id,
        };
      })
    );

    return {
      success: true,
      count: uploadedFiles.length,
      files: uploadedFiles,
    };
  }
}
