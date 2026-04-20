import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'منصة المشاريع' })
  siteName: string;

  @Column({ default: 'سوق بيع وشراء المشاريع الرقمية' })
  siteDescription: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  faviconUrl: string;

  @Column({ default: '© 2024 منصة المشاريع. جميع الحقوق محفوظة.' })
  footerText: string;

  @Column({ nullable: true })
  contactEmail: string;

  @Column({ nullable: true })
  facebookLink: string;

  @Column({ nullable: true })
  twitterLink: string;

  @Column({ nullable: true })
  instagramLink: string;

  @Column({ nullable: true })
  linkedinLink: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
