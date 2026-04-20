import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { KycService } from './kyc.service';
import { KycDocumentType } from './kyc-document.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const kycStorage = diskStorage({
  destination: './uploads/kyc',
  filename: (_, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `kyc-${unique}${extname(file.originalname)}`);
  },
});

@Controller('kyc')
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('submit')
  @UseInterceptors(FilesInterceptor('documents', 2, { storage: kycStorage }))
  async submit(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('documentType') documentType: KycDocumentType,
    @Request() req: any,
  ) {
    if (!files || files.length === 0) {
      return { error: 'يرجى رفع صورة الوثيقة' };
    }

    const baseUrl = `/uploads/kyc/`;
    const frontUrl = baseUrl + files[0].filename;
    const backUrl = files[1] ? baseUrl + files[1].filename : undefined;

    return this.kycService.submitDocument(
      req.user.id,
      documentType,
      frontUrl,
      backUrl,
    );
  }

  @Get('my-documents')
  getMyDocs(@Request() req: any) {
    return this.kycService.getMyDocuments(req.user.id);
  }

  // Admin
  @Get('pending')
  getPending() {
    return this.kycService.getPendingDocuments();
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Request() req: any) {
    return this.kycService.approveDocument(id, req.user.id);
  }

  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req: any,
  ) {
    return this.kycService.rejectDocument(id, req.user.id, reason);
  }
}
