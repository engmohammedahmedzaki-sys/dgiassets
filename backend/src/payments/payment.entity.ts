import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  dealId: string;

  @Column()
  buyerId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'buyerId' })
  buyer: User;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ default: 'SAR' })
  currency: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'text',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  moyasarId: string | null;

  @Column({ type: 'text', nullable: true })
  moyasarUrl: string | null;

  @Column({ type: 'jsonb', nullable: true })
  moyasarResponse: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
