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

  // === Integration API Keys (managed from dashboard) ===
  @Column({ type: 'text', nullable: true })
  moyasarSecretKey: string | null;

  @Column({ type: 'text', nullable: true })
  moyasarPublishableKey: string | null;

  @Column({ default: false })
  moyasarEnabled: boolean;

  @Column({ type: 'text', nullable: true })
  googleClientId: string | null;

  @Column({ type: 'text', nullable: true })
  googleClientSecret: string | null;

  @Column({ default: false })
  googleAuthEnabled: boolean;

  @Column({ type: 'text', nullable: true })
  smtpHost: string | null;

  @Column({ type: 'int', nullable: true })
  smtpPort: number | null;

  @Column({ type: 'text', nullable: true })
  smtpUser: string | null;

  @Column({ type: 'text', nullable: true })
  smtpPass: string | null;

  @Column({ type: 'text', nullable: true })
  smtpFrom: string | null;

  @Column({ default: false })
  smtpEnabled: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
