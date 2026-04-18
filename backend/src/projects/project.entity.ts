import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

export enum ProjectStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACTIVE = 'active',
  SOLD = 'sold',
  REJECTED = 'rejected',
}

export enum ProjectCategory {
  ECOMMERCE = 'ecommerce',
  SAAS = 'saas',
  MOBILE_APP = 'mobile_app',
  CONTENT_SITE = 'content_site',
  EDUCATION = 'education',
  GAMES = 'games',
  OTHER = 'other',
}

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('text')
  shortDescription: string;

  @Column({
    type: 'simple-enum',
    enum: ProjectCategory,
    default: ProjectCategory.OTHER,
  })
  category: ProjectCategory;

  @Column({
    type: 'simple-enum',
    enum: ProjectStatus,
    default: ProjectStatus.DRAFT,
  })
  status: ProjectStatus;

  // Pricing
  @Column('decimal', { precision: 12, scale: 2 })
  price: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  negotiablePrice: number;

  @Column({ default: false })
  isNegotiable: boolean;

  // Metrics
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  monthlyRevenue: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  monthlyProfit: number;

  @Column('int', { nullable: true })
  monthlyVisitors: number;

  @Column('int', { nullable: true })
  activeUsers: number;

  @Column('int', { nullable: true })
  ageInMonths: number;

  // Tech Stack
  @Column('simple-array', { nullable: true })
  techStack: string[];

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  demoUrl: string;

  // Media
  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ nullable: true })
  mainImage: string;

  // Additional Info
  @Column('text', { nullable: true })
  reasonForSelling: string;

  @Column('text', { nullable: true })
  highlights: string;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  offerCount: number;

  @Column({ default: false })
  isFeatured: boolean;

  // Owner
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  soldAt: Date;
}
