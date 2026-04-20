import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum KycDocumentType {
  NATIONAL_ID = 'national_id',
  PASSPORT = 'passport',
  COMMERCIAL_REGISTER = 'commercial_register',
}

export enum KycDocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('kyc_documents')
export class KycDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'text', enum: KycDocumentType })
  documentType: KycDocumentType;

  @Column({ type: 'text' })
  documentUrl: string;

  @Column({ type: 'text', nullable: true })
  backImageUrl: string | null;

  @Column({ type: 'text', default: KycDocumentStatus.PENDING })
  status: KycDocumentStatus;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ type: 'text', nullable: true })
  reviewedByAdminId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
