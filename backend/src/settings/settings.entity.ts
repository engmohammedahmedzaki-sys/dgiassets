import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'DGI Assets - الأصول الرقمية' })
  siteName: string;

  @Column({ default: 'أول سوق عربى متخصص لبيع وشراء الأصول الرقمية الموثّقة' })
  siteDescription: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  faviconUrl: string;

  @Column({ default: '© 2026 DGI Assets - الأصول الرقمية. جميع الحقوق محفوظة.' })
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

  // === SEO Settings ===
  @Column({ type: 'text', nullable: true })
  metaTitle: string | null;

  @Column({ type: 'text', nullable: true })
  metaDescription: string | null;

  @Column({ type: 'text', nullable: true })
  metaKeywords: string | null;

  @Column({ type: 'text', nullable: true })
  ogImage: string | null;

  @Column({ type: 'text', nullable: true })
  googleAnalyticsId: string | null;

  @Column({ type: 'text', nullable: true })
  facebookPixelId: string | null;

  // === Code Injection (for ads, scripts, integrations) ===
  @Column({ type: 'text', nullable: true })
  headCode: string | null;

  @Column({ type: 'text', nullable: true })
  bodyCode: string | null;

  @Column({ type: 'text', nullable: true })
  footerCode: string | null;

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

  // === Business / Commission ===
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 25.00 })
  commissionPercentage: number;

  @Column({ type: 'int', default: 3 })
  inspectionDays: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  holdbackPercentage: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
