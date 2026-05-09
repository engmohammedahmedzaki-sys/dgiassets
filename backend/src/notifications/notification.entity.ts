import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum NotificationType {
  OFFER_RECEIVED = 'offer_received',
  OFFER_ACCEPTED = 'offer_accepted',
  OFFER_REJECTED = 'offer_rejected',
  DEAL_CREATED = 'deal_created',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  TRANSFER_STARTED = 'transfer_started',
  DEAL_COMPLETED = 'deal_completed',
  DISPUTE_OPENED = 'dispute_opened',
  NEW_MESSAGE = 'new_message',
  PROJECT_SUBMITTED = 'project_submitted',
  PROJECT_APPROVED = 'project_approved',
  PROJECT_REJECTED = 'project_rejected',
  SYSTEM = 'system',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'text', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, any> | null;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
