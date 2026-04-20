import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  KycDocument,
  KycDocumentStatus,
  KycDocumentType,
} from './kyc-document.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class KycService {
  constructor(
    @InjectRepository(KycDocument)
    private kycRepository: Repository<KycDocument>,
    private usersService: UsersService,
  ) {}

  async submitDocument(
    userId: string,
    documentType: KycDocumentType,
    documentUrl: string,
    backImageUrl?: string,
  ): Promise<KycDocument> {
    const existing = await this.kycRepository.findOne({
      where: { userId, status: KycDocumentStatus.PENDING },
    });

    if (existing) {
      throw new BadRequestException(
        'لديك طلب KYC قيد المراجعة. يرجى انتظار النتيجة أولاً.',
      );
    }

    const doc = this.kycRepository.create({
      userId,
      documentType,
      documentUrl,
      backImageUrl: backImageUrl ?? null,
      status: KycDocumentStatus.PENDING,
    });

    const saved = await this.kycRepository.save(doc);

    // Update user kycStatus to pending
    await this.usersService.update(userId, { kycStatus: 'pending' } as any);

    return saved;
  }

  async getMyDocuments(userId: string): Promise<KycDocument[]> {
    return this.kycRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // Admin actions
  async getPendingDocuments(): Promise<KycDocument[]> {
    return this.kycRepository.find({
      where: { status: KycDocumentStatus.PENDING },
      order: { createdAt: 'ASC' },
    });
  }

  async approveDocument(docId: string, adminId: string): Promise<KycDocument> {
    const doc = await this.kycRepository.findOne({ where: { id: docId } });
    if (!doc) throw new NotFoundException('المستند غير موجود');

    doc.status = KycDocumentStatus.APPROVED;
    doc.reviewedByAdminId = adminId;
    await this.kycRepository.save(doc);

    await this.usersService.update(doc.userId, { kycStatus: 'verified' } as any);

    return doc;
  }

  async rejectDocument(
    docId: string,
    adminId: string,
    reason: string,
  ): Promise<KycDocument> {
    const doc = await this.kycRepository.findOne({ where: { id: docId } });
    if (!doc) throw new NotFoundException('المستند غير موجود');

    doc.status = KycDocumentStatus.REJECTED;
    doc.reviewedByAdminId = adminId;
    doc.rejectionReason = reason;
    await this.kycRepository.save(doc);

    await this.usersService.update(doc.userId, { kycStatus: 'unverified' } as any);

    return doc;
  }
}
