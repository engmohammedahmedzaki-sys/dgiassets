import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { MediaGalleryComponent } from '../media-gallery/media-gallery.component';
import { AuthService } from '../../../services/auth.service';
import { SettingsService, SiteSettings, IntegrationSettings } from '../../../services/settings.service';
import { UsersService, User } from '../../../services/users.service';
import { DealsService, Deal } from '../../../services/deals.service';
import { AdminService, AdminStats } from '../../../services/admin.service';
import { OffersService, Offer } from '../../../services/offers.service';
import { ProjectsService, Project } from '../../../services/projects.service';
import { KycService, KycDocument, KycDocumentType } from '../../../services/kyc.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, MediaGalleryComponent, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  userRole: string = 'buyer';
  selectedTab: string = 'overview';

  // ===== Live Clock =====
  currentTime: string = '';
  currentDate: string = '';
  private clockTimer: any = null;

  // ===== Animated Counters =====
  animated = {
    users: 0,
    projects: 0,
    offers: 0,
    deals: 0,
    revenue: 0,
    profit: 0,
  };
  private counterTimers: any[] = [];

  menuItems: any[] = [];

  siteSettings: SiteSettings | null = null;
  settingsLoading = false;
  settingsSuccess = false;
  settingsError = '';

  // Integrations (API Settings)
  integrations: IntegrationSettings | null = null;
  integrationsLoading = false;
  integrationsSaving = false;
  integrationsSuccess = '';
  integrationsError = '';

  // Admin stats (overview)
  adminStats: AdminStats | null = null;
  statsLoading = false;
  statsError = '';

  // Deals
  deals: Deal[] = [];
  dealsLoading = false;

  // My Offers (buyer = sent, seller = received)
  myOffers: Offer[] = [];
  offersLoading = false;

  // My Projects/Listings (seller)
  myProjects: Project[] = [];
  myProjectsLoading = false;

  // Admin: All Projects
  allProjects: Project[] = [];
  allProjectsLoading = false;
  projectsFilter: 'all' | 'pending' | 'active' | 'sold' | 'rejected' = 'all';

  // Profile Settings
  profile: { fullName: string; email: string; phoneNumber: string; whatsappNumber: string } = {
    fullName: '', email: '', phoneNumber: '', whatsappNumber: '',
  };
  profileLoading = false;
  profileSaving = false;
  profileSuccess = '';
  profileError = '';

  passwords = { current: '', new: '', confirm: '' };
  passwordSaving = false;
  passwordSuccess = '';
  passwordError = '';

  // KYC
  myKycDocs: KycDocument[] = [];
  pendingKycDocs: KycDocument[] = [];
  kycLoading = false;
  kycSaving = false;
  kycError = '';
  kycSuccess = '';
  kycForm: { documentType: KycDocumentType; frontFile: File | null; backFile: File | null } = {
    documentType: 'national_id',
    frontFile: null,
    backFile: null,
  };

  // User Management
  users: User[] = [];
  usersLoading = false;
  usersError = '';

  showAddUserModal = false;
  newUser = {
    fullName: '',
    email: '',
    password: '',
    role: 'buyer'
  };
  addUserLoading = false;

  constructor(
    private authService: AuthService,
    private settingsService: SettingsService,
    private usersService: UsersService,
    private dealsService: DealsService,
    private adminService: AdminService,
    private offersService: OffersService,
    private projectsService: ProjectsService,
    private kycService: KycService,
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userRole = user.role;
        this.buildMenu();
        // Auto-load overview data based on role
        if (user.role === 'admin') {
          this.loadAdminStats();
        } else {
          this.loadOverviewForUser();
        }
      }
    });

    this.settingsService.settings$.subscribe(settings => {
      this.siteSettings = settings ? { ...settings } : null;
    });

    this.startClock();
  }

  ngOnDestroy() {
    if (this.clockTimer) clearInterval(this.clockTimer);
    this.counterTimers.forEach(t => cancelAnimationFrame(t));
  }

  // ===== Live Clock =====
  private startClock() {
    const update = () => {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true });
      this.currentDate = now.toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };
    update();
    this.clockTimer = setInterval(update, 30000);
  }

  // ===== Animated Counters (count-up effect) =====
  private animateCount(key: keyof typeof this.animated, target: number, duration = 1100) {
    const start = performance.now();
    const from = this.animated[key];
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      this.animated[key] = Math.round(from + (target - from) * eased);
      if (t < 1) {
        const id = requestAnimationFrame(tick);
        this.counterTimers.push(id);
      }
    };
    const id = requestAnimationFrame(tick);
    this.counterTimers.push(id);
  }

  private animateAdminCounters() {
    if (!this.adminStats) return;
    const s = this.adminStats;
    this.animateCount('users', s.totalUsers);
    this.animateCount('projects', s.totalProjects);
    this.animateCount('offers', s.totalOffers);
    this.animateCount('deals', s.totalDeals);
    this.animateCount('revenue', s.totalRevenue);
    this.animateCount('profit', Math.round(s.totalRevenue * 0.25));
  }

  private animateUserCounters() {
    this.animateCount('offers', this.myOffers.length);
    this.animateCount('deals', this.deals.length);
    this.animateCount('projects', this.myProjects.length);
    const totalSales = this.deals
      .filter(d => d.status === 'completed')
      .reduce((sum, d: any) => sum + (Number(d.amount) || Number(d.totalAmount) || 0), 0);
    this.animateCount('revenue', totalSales);
    this.animateCount('profit', Math.round(totalSales * 0.75));
  }

  loadOverviewForUser() {
    // For buyer/seller: load deals + offers in parallel
    this.loadDeals();
    if (this.userRole === 'seller') {
      this.loadMyProjects();
      this.loadMyOffers('received');
    } else {
      this.loadMyOffers('sent');
    }
    // Animate counters once data settles
    setTimeout(() => this.animateUserCounters(), 1500);
  }

  loadMyOffers(type: 'sent' | 'received') {
    this.offersLoading = true;
    this.offersService.getMyOffers(type).subscribe({
      next: (offers) => {
        this.myOffers = offers;
        this.offersLoading = false;
      },
      error: () => { this.offersLoading = false; },
    });
  }

  loadMyProjects() {
    this.myProjectsLoading = true;
    this.projectsService.getMyProjects().subscribe({
      next: (projects) => {
        this.myProjects = projects;
        this.myProjectsLoading = false;
      },
      error: () => { this.myProjectsLoading = false; },
    });
  }

  acceptOffer(offer: Offer) {
    if (!confirm(`قبول عرض ${offer.offerAmount} ريال على "${offer.project?.title}"؟`)) return;
    this.offersService.acceptOffer(offer.id).subscribe({
      next: () => this.loadMyOffers('received'),
      error: (e) => alert(e.error?.message || 'حدث خطأ'),
    });
  }

  rejectOffer(offer: Offer) {
    const reason = prompt('سبب الرفض:');
    if (!reason) return;
    this.offersService.rejectOffer(offer.id, reason).subscribe({
      next: () => this.loadMyOffers('received'),
      error: (e) => alert(e.error?.message || 'حدث خطأ'),
    });
  }

  withdrawOffer(offer: Offer) {
    if (!confirm('هل أنت متأكد من سحب العرض؟')) return;
    this.offersService.withdrawOffer(offer.id).subscribe({
      next: () => this.loadMyOffers('sent'),
      error: (e) => alert(e.error?.message || 'حدث خطأ'),
    });
  }

  offerStatusLabel(status: string) {
    return this.offersService.statusLabel(status);
  }

  // Helpers for buyer/seller overview cards
  get pendingOffersCount(): number {
    return this.myOffers.filter(o => o.status === 'pending').length;
  }
  get acceptedOffersCount(): number {
    return this.myOffers.filter(o => o.status === 'accepted').length;
  }
  get activeDealsCount(): number {
    return this.deals.filter(d => !['completed', 'cancelled', 'refunded'].includes(d.status)).length;
  }
  get completedDealsCount(): number {
    return this.deals.filter(d => d.status === 'completed').length;
  }
  get activeListingsCount(): number {
    return this.myProjects.filter(p => p.status === 'active').length;
  }
  get pendingListingsCount(): number {
    return this.myProjects.filter(p => p.status === 'pending').length;
  }

  loadAdminStats() {
    this.statsLoading = true;
    this.statsError = '';
    this.adminService.getStats().subscribe({
      next: (stats) => {
        this.adminStats = stats;
        this.statsLoading = false;
        setTimeout(() => this.animateAdminCounters(), 100);
      },
      error: (err) => {
        this.statsLoading = false;
        const status = err?.status;
        if (status === 401) this.statsError = 'انتهت الجلسة. قم بتسجيل الدخول مجدداً.';
        else if (status === 403) this.statsError = 'ليس لديك صلاحية لعرض الإحصائيات.';
        else this.statsError = 'تعذّر تحميل الإحصائيات. حاول مرة أخرى.';
      },
    });
  }

  // ===== KPI Helpers =====
  get revenueGrowthPct(): number {
    const data = this.adminStats?.revenueByMonth;
    if (!data || data.length < 2) return 0;
    const last = data[data.length - 1].revenue;
    const prev = data[data.length - 2].revenue;
    if (prev === 0) return last > 0 ? 100 : 0;
    return Math.round(((last - prev) / prev) * 100);
  }

  get isRevenueUp(): boolean {
    return this.revenueGrowthPct >= 0;
  }

  get totalCommission(): number {
    return Math.round((this.adminStats?.totalRevenue || 0) * 0.25);
  }

  get conversionRate(): number {
    const offers = this.adminStats?.totalOffers || 0;
    const deals = this.adminStats?.totalDeals || 0;
    if (offers === 0) return 0;
    return Math.round((deals / offers) * 100);
  }

  get avgDealValue(): number {
    const total = this.adminStats?.totalRevenue || 0;
    const deals = this.adminStats?.completedDeals || 0;
    if (deals === 0) return 0;
    return Math.round(total / deals);
  }

  // ===== Mini Sparkline (40x14 for KPI cards) =====
  miniSparkline(values: number[]): string {
    if (!values || values.length < 2) return '';
    const w = 60, h = 18;
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const step = w / (values.length - 1);
    const pts = values.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`);
    return 'M ' + pts.join(' L ');
  }

  get usersSparkData(): number[] {
    const total = this.adminStats?.totalUsers || 0;
    return [Math.max(0, total - 50), total - 38, total - 30, total - 22, total - 14, total - 7, total];
  }
  get projectsSparkData(): number[] {
    const total = this.adminStats?.totalProjects || 0;
    return [Math.max(0, total - 18), total - 14, total - 10, total - 7, total - 4, total - 2, total];
  }
  get offersSparkData(): number[] {
    const total = this.adminStats?.totalOffers || 0;
    return [Math.max(0, total - 30), total - 24, total - 18, total - 12, total - 8, total - 4, total];
  }
  get dealsSparkData(): number[] {
    return (this.adminStats?.revenueByMonth || []).map(m => m.revenue);
  }

  // ===== Recent Activity Feed =====
  get recentActivity(): Array<{icon: string; title: string; subtitle: string; time: string; tone: string}> {
    const items: Array<{icon: string; title: string; subtitle: string; time: string; tone: string; ts: number}> = [];

    // Add recent projects
    (this.adminStats?.recentProjects || []).forEach(p => {
      items.push({
        icon: '💼',
        title: `أصل جديد: ${p.title}`,
        subtitle: `${(p.price || 0).toLocaleString('ar-EG')} ر.س`,
        time: this.relativeTime(p.createdAt),
        tone: 'blue',
        ts: new Date(p.createdAt).getTime(),
      });
    });

    // Add recent offers (for sellers/buyers)
    this.myOffers.slice(0, 5).forEach(o => {
      items.push({
        icon: '📨',
        title: o.status === 'pending' ? 'عرض جديد بانتظار الرد' : `عرض ${this.offerStatusLabel(o.status)}`,
        subtitle: `${(o.offerAmount || 0).toLocaleString('ar-EG')} ر.س على "${o.project?.title || '—'}"`,
        time: this.relativeTime((o as any).createdAt),
        tone: o.status === 'accepted' ? 'green' : o.status === 'rejected' ? 'red' : 'amber',
        ts: new Date((o as any).createdAt || 0).getTime(),
      });
    });

    // Add recent deals
    this.deals.slice(0, 5).forEach(d => {
      items.push({
        icon: d.status === 'completed' ? '✅' : '🤝',
        title: d.status === 'completed' ? 'صفقة مكتملة' : 'صفقة جارية',
        subtitle: `${((d as any).totalAmount || (d as any).amount || 0).toLocaleString('ar-EG')} ر.س`,
        time: this.relativeTime((d as any).createdAt),
        tone: d.status === 'completed' ? 'green' : 'blue',
        ts: new Date((d as any).createdAt || 0).getTime(),
      });
    });

    return items.sort((a, b) => b.ts - a.ts).slice(0, 8).map(({ts, ...rest}) => rest);
  }

  private relativeTime(dateStr: string | undefined): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'الآن';
    if (m < 60) return `منذ ${m} دقيقة`;
    const h = Math.floor(m / 60);
    if (h < 24) return `منذ ${h} ساعة`;
    const days = Math.floor(h / 24);
    if (days < 7) return `منذ ${days} يوم`;
    return d.toLocaleDateString('ar-SA');
  }

  // ===== Status Distribution (donut data) =====
  get statusDistribution(): Array<{label: string; value: number; color: string; pct: number}> {
    const s = this.adminStats;
    if (!s) return [];
    const total = s.totalProjects || 1;
    return [
      { label: 'نشط', value: s.activeProjects, color: '#10b981', pct: Math.round((s.activeProjects / total) * 100) },
      { label: 'قيد المراجعة', value: s.pendingProjects, color: '#f59e0b', pct: Math.round((s.pendingProjects / total) * 100) },
      { label: 'مباع', value: s.soldProjects, color: '#3b6cb5', pct: Math.round((s.soldProjects / total) * 100) },
    ];
  }

  // Donut helpers (Angular templates don't allow arrow functions in expressions)
  donutDashArray(pct: number): string {
    return (pct * 3.01) + ' 301';
  }

  donutDashOffset(index: number): number {
    const dist = this.statusDistribution;
    let sum = 0;
    for (let j = 0; j < index; j++) sum += dist[j].pct;
    return -(sum * 3.01);
  }

  // ===== Reports: Print + CSV Export =====
  printDashboard() {
    document.body.classList.add('printing-dashboard');
    window.print();
    setTimeout(() => document.body.classList.remove('printing-dashboard'), 1000);
  }

  exportToCSV() {
    if (!this.adminStats) {
      alert('لا توجد بيانات للتصدير');
      return;
    }
    const s = this.adminStats;
    const rows = [
      ['التقرير', 'القيمة'],
      ['إجمالى المستخدمين', s.totalUsers],
      ['المستخدمين الموثقين', s.verifiedUsers],
      ['إجمالى المشاريع', s.totalProjects],
      ['المشاريع النشطة', s.activeProjects],
      ['المشاريع قيد المراجعة', s.pendingProjects],
      ['المشاريع المباعة', s.soldProjects],
      ['إجمالى العروض', s.totalOffers],
      ['العروض قيد المراجعة', s.pendingOffers],
      ['إجمالى الصفقات', s.totalDeals],
      ['الصفقات المكتملة', s.completedDeals],
      ['إجمالى الإيرادات (ر.س)', s.totalRevenue],
      ['العمولة (25%)', this.totalCommission],
      ['متوسط قيمة الصفقة', this.avgDealValue],
      ['نسبة التحويل (%)', this.conversionRate],
      [],
      ['الشهر', 'الإيرادات'],
      ...s.revenueByMonth.map(m => [m.month, m.revenue]),
    ];
    const csv = '﻿' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  refreshAll() {
    if (this.userRole === 'admin') this.loadAdminStats();
    else this.loadOverviewForUser();
  }

  // Build SVG sparkline path from revenueByMonth
  getRevenueSparkline(): string {
    if (!this.adminStats?.revenueByMonth?.length) return '';
    const data = this.adminStats.revenueByMonth;
    if (data.length < 2) return '';
    const max = Math.max(...data.map(d => d.revenue), 1);
    const w = 300, h = 80;
    const step = w / (data.length - 1);
    const points = data.map((d, i) => `${i * step},${h - (d.revenue / max) * h}`);
    return 'M ' + points.join(' L ');
  }

  // Build full revenue line for the big chart (600x180)
  getRevenueLinePath(): string {
    if (!this.adminStats?.revenueByMonth?.length) return '';
    const data = this.adminStats.revenueByMonth;
    if (data.length < 2) return '';
    const max = Math.max(...data.map(d => d.revenue), 1);
    const w = 600, h = 180;
    const step = w / (data.length - 1);
    const points = data.map((d, i) => `${i * step},${h - (d.revenue / max) * (h - 12) - 6}`);
    return 'M ' + points.join(' L ');
  }

  getRevenueAreaPath(): string {
    const line = this.getRevenueLinePath();
    if (!line) return '';
    return line + ' L 600,180 L 0,180 Z';
  }

  // Verified percentage helper (avoids Math.* in template)
  get verifiedUsersPct(): number {
    const total = this.adminStats?.totalUsers || 0;
    const verified = this.adminStats?.verifiedUsers || 0;
    if (total === 0) return 0;
    return Math.round((verified / total) * 100);
  }

  buildMenu() {
    const baseMenu = [
      { label: 'لوحة التحكم', icon: '🏠', route: 'overview' },
    ];

    if (this.userRole === 'admin') {
      this.menuItems = [
        ...baseMenu,
        { label: 'المشاريع', icon: '💼', route: 'projects' },
        { label: 'المستخدمين', icon: '👥', route: 'users' },
        { label: 'الصفقات', icon: '🤝', route: 'deals' },
        { label: 'طلبات التوثيق (KYC)', icon: '🪪', route: 'kyc' },
        { label: 'مكتبة الوسائط', icon: '🖼️', route: 'media' },
        { label: 'إعدادات الموقع', icon: '⚙️', route: 'settings' },
        { label: 'SEO ومحركات البحث', icon: '🔍', route: 'seo' },
        { label: 'حقن الأكواد', icon: '📝', route: 'code-injection' },
        { label: 'إعدادات الـ API', icon: '🔌', route: 'integrations' },
      ];
    } else if (this.userRole === 'seller') {
      this.menuItems = [
        ...baseMenu,
        { label: 'مشاريعي', icon: '📊', route: 'my-listings' },
        { label: 'العروض', icon: '💼', route: 'offers' },
        { label: 'صفقاتي', icon: '🤝', route: 'deals' },
        { label: 'التوثيق (KYC)', icon: '🪪', route: 'kyc' },
        { label: 'مكتبة الوسائط', icon: '🖼️', route: 'media' },
        { label: 'الإعدادات الشخصية', icon: '⚙️', route: 'profile-settings' },
      ];
    } else {
      // Buyer
      this.menuItems = [
        ...baseMenu,
        { label: 'المشاريع المتابعة', icon: '⭐', route: 'favorites' },
        { label: 'عروضي', icon: '💼', route: 'my-offers' },
        { label: 'صفقاتي', icon: '🤝', route: 'deals' },
        { label: 'المشتريات', icon: '✅', route: 'purchases' },
        { label: 'التوثيق (KYC)', icon: '🪪', route: 'kyc' },
        { label: 'الإعدادات الشخصية', icon: '⚙️', route: 'profile-settings' },
      ];
    }
  }

  onTabSelect(tabId: string) {
    this.selectedTab = tabId;
    if (tabId === 'users' && this.userRole === 'admin') this.loadUsers();
    if (tabId === 'deals') this.loadDeals();
    if (tabId === 'integrations' && this.userRole === 'admin') this.loadIntegrations();
    if (tabId === 'my-offers') this.loadMyOffers('sent');
    if (tabId === 'offers' && this.userRole === 'seller') this.loadMyOffers('received');
    if (tabId === 'my-listings' && this.userRole === 'seller') this.loadMyProjects();
    if (tabId === 'purchases' || tabId === 'favorites') this.loadDeals();
    if (tabId === 'projects' && this.userRole === 'admin') this.loadAllProjects();
    if (tabId === 'profile-settings') this.loadProfile();
    if (tabId === 'kyc') this.loadKyc();
  }

  // ===== KYC =====
  loadKyc() {
    this.kycLoading = true;
    if (this.userRole === 'admin') {
      this.kycService.getPendingDocuments().subscribe({
        next: (docs) => { this.pendingKycDocs = docs; this.kycLoading = false; },
        error: () => { this.kycLoading = false; },
      });
    } else {
      this.kycService.getMyDocuments().subscribe({
        next: (docs) => { this.myKycDocs = docs; this.kycLoading = false; },
        error: () => { this.kycLoading = false; },
      });
    }
  }

  onKycFileSelect(event: Event, side: 'front' | 'back') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      if (side === 'front') this.kycForm.frontFile = input.files[0];
      else this.kycForm.backFile = input.files[0];
    }
  }

  submitKyc() {
    this.kycError = '';
    this.kycSuccess = '';
    if (!this.kycForm.frontFile) {
      this.kycError = 'يرجى رفع صورة الوثيقة (الوجه الأمامى)';
      return;
    }
    this.kycSaving = true;
    this.kycService.submitDocument(
      this.kycForm.documentType,
      this.kycForm.frontFile,
      this.kycForm.backFile || undefined,
    ).subscribe({
      next: () => {
        this.kycSaving = false;
        this.kycSuccess = '✅ تم رفع الوثيقة بنجاح. سيتم مراجعتها خلال 24-48 ساعة.';
        this.kycForm = { documentType: 'national_id', frontFile: null, backFile: null };
        this.loadKyc();
      },
      error: (e) => {
        this.kycSaving = false;
        this.kycError = e.error?.message || 'فشل رفع الوثيقة';
      },
    });
  }

  approveKyc(doc: KycDocument) {
    if (!confirm(`الموافقة على توثيق ${doc.user?.fullName || doc.userId}؟`)) return;
    this.kycService.approveDocument(doc.id).subscribe({
      next: () => this.loadKyc(),
      error: (e) => alert(e.error?.message || 'حدث خطأ'),
    });
  }

  rejectKyc(doc: KycDocument) {
    const reason = prompt('سبب الرفض:');
    if (!reason) return;
    this.kycService.rejectDocument(doc.id, reason).subscribe({
      next: () => this.loadKyc(),
      error: (e) => alert(e.error?.message || 'حدث خطأ'),
    });
  }

  kycDocTypeLabel(type: string) { return this.kycService.documentTypeLabel(type); }
  kycStatusLabel(status: string) { return this.kycService.statusLabel(status); }

  get hasPendingKyc(): boolean {
    return this.myKycDocs.some(d => d.status === 'pending');
  }
  get hasApprovedKyc(): boolean {
    return this.myKycDocs.some(d => d.status === 'approved');
  }

  loadProfile() {
    this.profileLoading = true;
    this.usersService.getMe().subscribe({
      next: (user) => {
        this.profile = {
          fullName: user.fullName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          whatsappNumber: user.whatsappNumber || '',
        };
        this.profileLoading = false;
      },
      error: () => { this.profileLoading = false; },
    });
  }

  saveProfile() {
    this.profileSaving = true;
    this.profileSuccess = '';
    this.profileError = '';
    this.usersService.updateMe({
      fullName: this.profile.fullName,
      phoneNumber: this.profile.phoneNumber,
      whatsappNumber: this.profile.whatsappNumber,
    }).subscribe({
      next: () => {
        this.profileSaving = false;
        this.profileSuccess = '✅ تم حفظ البيانات بنجاح';
        setTimeout(() => this.profileSuccess = '', 4000);
      },
      error: (e) => {
        this.profileSaving = false;
        this.profileError = e.error?.message || 'حدث خطأ';
      },
    });
  }

  changePassword() {
    this.passwordSuccess = '';
    this.passwordError = '';
    if (this.passwords.new !== this.passwords.confirm) {
      this.passwordError = 'كلمتا المرور غير متطابقتين';
      return;
    }
    if (this.passwords.new.length < 6) {
      this.passwordError = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      return;
    }
    this.passwordSaving = true;
    this.usersService.changePassword(this.passwords.current, this.passwords.new).subscribe({
      next: () => {
        this.passwordSaving = false;
        this.passwordSuccess = '✅ تم تغيير كلمة المرور بنجاح';
        this.passwords = { current: '', new: '', confirm: '' };
        setTimeout(() => this.passwordSuccess = '', 4000);
      },
      error: (e) => {
        this.passwordSaving = false;
        this.passwordError = e.error?.message || 'حدث خطأ';
      },
    });
  }

  loadAllProjects() {
    this.allProjectsLoading = true;
    this.adminService.getAllProjects().subscribe({
      next: (res: any) => {
        this.allProjects = res.projects || [];
        this.allProjectsLoading = false;
      },
      error: () => { this.allProjectsLoading = false; },
    });
  }

  get filteredAdminProjects(): Project[] {
    if (this.projectsFilter === 'all') return this.allProjects;
    return this.allProjects.filter(p => p.status === this.projectsFilter);
  }

  approveAdminProject(project: Project) {
    if (!confirm(`الموافقة على نشر "${project.title}"؟`)) return;
    this.adminService.approveProject(project.id).subscribe({
      next: () => this.loadAllProjects(),
      error: (e) => alert(e.error?.message || 'حدث خطأ'),
    });
  }

  rejectAdminProject(project: Project) {
    if (!confirm(`رفض "${project.title}"؟ سيتم حذفه نهائياً.`)) return;
    this.adminService.rejectProject(project.id).subscribe({
      next: () => this.loadAllProjects(),
      error: (e) => alert(e.error?.message || 'حدث خطأ'),
    });
  }

  deleteAdminProject(project: Project) {
    if (!confirm(`حذف "${project.title}" نهائياً؟`)) return;
    this.adminService.deleteProject(project.id).subscribe({
      next: () => this.loadAllProjects(),
      error: (e) => alert(e.error?.message || 'حدث خطأ'),
    });
  }

  projectStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'مسودة',
      pending: 'بانتظار المراجعة',
      active: 'نشط',
      sold: 'مباع',
      rejected: 'مرفوض',
    };
    return labels[status] || status;
  }

  loadDeals() {
    this.dealsLoading = true;
    this.dealsService.getMyDeals().subscribe({
      next: (deals) => {
        this.deals = deals;
        this.dealsLoading = false;
      },
      error: () => { this.dealsLoading = false; },
    });
  }

  loadIntegrations() {
    this.integrationsLoading = true;
    this.settingsService.getIntegrations().subscribe({
      next: (data) => {
        this.integrations = {
          ...data,
          // Clear masked secrets so admin can re-type cleanly
          moyasarSecretKey: '',
          googleClientSecret: '',
          smtpPass: '',
        };
        this.integrationsLoading = false;
      },
      error: () => { this.integrationsLoading = false; },
    });
  }

  saveIntegrations() {
    if (!this.integrations) return;
    this.integrationsSaving = true;
    this.integrationsSuccess = '';
    this.integrationsError = '';

    this.settingsService.updateIntegrations(this.integrations).subscribe({
      next: () => {
        this.integrationsSaving = false;
        this.integrationsSuccess = 'تم حفظ إعدادات الـ API بنجاح ✅';
        this.loadIntegrations();
        setTimeout(() => this.integrationsSuccess = '', 4000);
      },
      error: (err) => {
        this.integrationsSaving = false;
        this.integrationsError = err.error?.message ?? 'حدث خطأ أثناء الحفظ';
      },
    });
  }

  getDealStatusLabel(status: string): string {
    return this.dealsService.getStatusLabel(status as any);
  }

  currentUserKycStatus(): string {
    const user = this.authService.getCurrentUser() as any;
    const status = user?.kycStatus ?? 'unverified';
    const labels: Record<string, string> = {
      unverified: 'غير موثّق',
      pending: 'قيد المراجعة',
      verified: 'موثّق ✅',
    };
    return labels[status] ?? status;
  }

  loadUsers() {
    this.usersLoading = true;
    this.usersService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.usersLoading = false;
      },
      error: (err) => {
        this.usersError = 'حدث خطأ أثناء تحميل المستخدمين';
        this.usersLoading = false;
      }
    });
  }

  updateUserRole(user: User, newRole: string) {
    if (confirm(`هل أنت متأكد من تغيير رتبة ${user.fullName} إلى ${newRole}؟`)) {
      this.usersService.updateUserRole(user.id, newRole).subscribe({
        next: () => this.loadUsers(),
        error: (err) => alert('حدث خطأ أثناء تحديث الرتبة')
      });
    }
  }

  deleteUser(user: User) {
    if (confirm(`هل أنت متأكد من حذف المستخدم ${user.fullName}؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      this.usersService.deleteUser(user.id).subscribe({
        next: () => this.loadUsers(),
        error: (err) => alert('حدث خطأ أثناء حذف المستخدم')
      });
    }
  }

  toggleUserStatus(user: any) {
    const action = user.isActive ? 'إيقاف' : 'تفعيل';
    if (confirm(`هل أنت متأكد من ${action} حساب ${user.fullName}؟`)) {
      this.usersService.toggleStatus(user.id).subscribe({
        next: () => this.loadUsers(),
        error: (err) => alert('حدث خطأ أثناء تغيير حالة الحساب')
      });
    }
  }

  addUser() {
    this.addUserLoading = true;
    // Note: We need a backend endpoint for this too. I'll add it.
    this.authService.register(this.newUser).subscribe({
      next: () => {
        this.addUserLoading = false;
        this.showAddUserModal = false;
        this.loadUsers();
        this.newUser = { fullName: '', email: '', password: '', role: 'buyer' };
      },
      error: (err) => {
        this.addUserLoading = false;
        alert('حدث خطأ أثناء إضافة المستخدم');
      }
    });
  }

  saveSettings() {
    if (!this.siteSettings) return;

    this.settingsLoading = true;
    this.settingsError = '';
    this.settingsSuccess = false;

    this.settingsService.updateSettings(this.siteSettings).subscribe({
      next: (res) => {
        this.settingsLoading = false;
        this.settingsSuccess = true;
        setTimeout(() => this.settingsSuccess = false, 3000);
      },
      error: (err) => {
        this.settingsLoading = false;
        this.settingsError = 'حدث خطأ أثناء حفظ الإعدادات';
        console.error(err);
      }
    });
  }
}
