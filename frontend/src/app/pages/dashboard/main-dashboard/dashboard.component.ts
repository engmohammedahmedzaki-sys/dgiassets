import { Component, OnInit } from '@angular/core';
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
export class DashboardComponent implements OnInit {
  userRole: string = 'buyer';
  selectedTab: string = 'overview';

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
