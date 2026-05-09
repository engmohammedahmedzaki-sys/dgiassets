import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

export enum ProjectStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACTIVE = 'active',
  SOLD = 'sold',
  REJECTED = 'rejected',
}

export enum ListingType {
  FIXED = 'fixed',
  AUCTION = 'auction',
}

export enum ProjectCategory {
  DOMAINS = 'domains',
  WEBSITES = 'websites',
  ECOMMERCE = 'ecommerce',
  MOBILE_APPS = 'mobile_apps',
  SAAS = 'saas',
  DIGITAL_ACCOUNTS = 'digital_accounts',
  DIGITAL_CONTENT = 'digital_content',
  BRANDING = 'branding',
  DATABASES = 'databases',
  GAMES = 'games',
  INTELLECTUAL_PROPERTY = 'intellectual_property',
  SERVICES = 'services',
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

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  monetizationType: string; // e.g., Subscriptions, Ads, Affiliate

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  profitMargin: number;

  @Column({ default: false })
  requiresNDA: boolean;

  @Column({ default: false })
  isAvailableForRental: boolean;

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

  // Auction fields
  @Column({
    type: 'simple-enum',
    enum: ListingType,
    default: ListingType.FIXED,
  })
  listingType: ListingType;

  @Column({ type: 'timestamp', nullable: true })
  auctionEndsAt: Date | null;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  minBid: number | null;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  currentHighBid: number | null;

  @Column({ nullable: true })
  currentHighBidderId: string | null;

  @Column({ default: 0 })
  bidCount: number;

  @Column({ default: false })
  auctionFinalized: boolean;

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
