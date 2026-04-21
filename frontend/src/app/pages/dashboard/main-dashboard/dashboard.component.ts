import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { MediaGalleryComponent } from '../media-gallery/media-gallery.component';
import { AuthService } from '../../../services/auth.service';
import { SettingsService, SiteSettings, IntegrationSettings } from '../../../services/settings.service';
import { UsersService, User } from '../../../services/users.service';
import { DealsService, Deal } from '../../../services/deals.service';
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

  // Deals
  deals: Deal[] = [];
  dealsLoading = false;

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
    private dealsService: DealsService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userRole = user.role;
        this.buildMenu();
      }
    });

    this.settingsService.settings$.subscribe(settings => {
      this.siteSettings = settings ? { ...settings } : null;
    });
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
