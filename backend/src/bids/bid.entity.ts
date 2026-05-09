import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';

@Entity('bids')
@Index(['projectId', 'createdAt'])
export class Bid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  bidderId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'bidderId' })
  bidder: User;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  ipAddress: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
