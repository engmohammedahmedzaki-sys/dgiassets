import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { Offer } from '../offers/offer.entity';

export enum DealStatus {
  INITIATED = 'initiated',
  PAYMENT_PENDING = 'payment_pending',
  PAID = 'paid',
  TRANSFER_STARTED = 'transfer_started',
  INSPECTION = 'inspection',
  COMPLETED = 'completed',
  DISPUTED = 'disputed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

@Entity('deals')
export class Deal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  offerId: string;

  @ManyToOne(() => Offer, { eager: true })
  @JoinColumn({ name: 'offerId' })
  offer: Offer;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, { eager: true })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  buyerId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'buyerId' })
  buyer: User;

  @Column()
  sellerId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column('decimal', { precision: 12, scale: 2 })
  finalAmount: number;

  @Column({
    type: 'text',
    default: DealStatus.INITIATED,
  })
  status: DealStatus;

  @Column({ type: 'timestamp', nullable: true })
  inspectionDeadline: Date | null;

  @Column({ type: 'text', nullable: true })
  transferNotes: string | null;

  @Column({ type: 'text', nullable: true })
  disputeReason: string | null;

  @Column({ type: 'text', nullable: true })
  adminNotes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
