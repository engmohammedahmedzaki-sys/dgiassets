import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { AuthService } from '../../services/auth.service';
import { SettingsService } from '../../services/settings.service';
import { ValuationService, ValuationResult } from '../../services/valuation.service';

@Component({
  selector: 'app-sell',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sell.component.html',
  styleUrl: './sell.component.css'
})
export class SellComponent {
  currentStep = 1;
  totalSteps = 4;

  // Form Data
  projectData = {
    // Step 1: Basic Info
    title: '',
    category: '',
    shortDescription: '',
    description: '',

    // Step 2: Metrics
    listingType: 'fixed' as 'fixed' | 'auction',
    price: 0,
    isNegotiable: false,
    minBid: 0,
    auctionDurationDays: 7,
    auctionEndsAt: null as string | null,
    monthlyRevenue: 0,
    monthlyProfit: 0,
    monthlyVisitors: 0,
    activeUsers: 0,
    ageInMonths: 0,
    location: '',
    monetizationType: '',
    profitMargin: 0,

    // Step 3: Details
    website: '',
    demoUrl: '',
    techStack: [] as string[],
    reasonForSelling: '',
    highlights: '',
    requiresNDA: false,
    isAvailableForRental: false,

    // Step 4: Media
    mainImage: '',
    images: [] as string[]
  };

  auctionDurations = [
    { value: 3, label: '3 أيام' },
    { value: 5, label: '5 أيام' },
    { value: 7, label: 'أسبوع' },
    { value: 14, label: 'أسبوعين' },
    { value: 30, label: 'شهر' },
  ];

  techStackInput = '';
  
  categories = [
    { value: 'domains', label: 'دومينات', icon: '🌐' },
    { value: 'websites', label: 'مواقع إلكترونية', icon: '🖥️' },
    { value: 'ecommerce', label: 'متاجر إلكترونية', icon: '🛒' },
    { value: 'mobile_apps', label: 'تطبيقات موبايل', icon: '📱' },
    { value: 'saas', label: 'برمجيات SaaS', icon: '☁️' },
    { value: 'digital_accounts', label: 'حسابات رقمية (يوتيوب/تيكتوك/انستا)', icon: '📲' },
    { value: 'digital_content', label: 'محتوى رقمي (كتب/دورات/قنوات)', icon: '📚' },
    { value: 'branding', label: 'علامات تجارية رقمية', icon: '🏷️' },
    { value: 'databases', label: 'قواعد بيانات', icon: '🗄️' },
    { value: 'games', label: 'ألعاب وأصول الألعاب', icon: '🎮' },
    { value: 'intellectual_property', label: 'ملكية فكرية / اختراعات', icon: '💡' },
    { value: 'services', label: 'خدمات رقمية', icon: '🔧' },
    { value: 'other', label: 'أخرى', icon: '📦' }
  ];

  monetizationTypes = [
    { value: 'subscriptions', label: 'اشتراكات' },
    { value: 'ads', label: 'إعلانات' },
    { value: 'affiliate', label: 'تسويق بالعمولة' },
    { value: 'ecommerce_sales', label: 'مبيعات مباشرة' },
    { value: 'digital_products', label: 'منتجات رقمية' },
    { value: 'services', label: 'خدمات' },
    { value: 'other', label: 'أخرى' }
  ];

  loading = false;
  error = '';
  aiValuation = 0;

  // AI valuation result
  valuationResult: ValuationResult | null = null;
  valuationLoading = false;
  valuationError = '';
  private valuationDebounce: any = null;

  // Marketplace economics (defaults until settings load)
  commissionPercentage = 25;
  inspectionDays = 3;

  constructor(
    private projectsService: ProjectsService,
    private authService: AuthService,
    private settingsService: SettingsService,
    private valuationService: ValuationService,
    private router: Router
  ) {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }

    this.settingsService.settings$.subscribe(s => {
      if (s?.commissionPercentage != null) this.commissionPercentage = Number(s.commissionPercentage);
      if (s?.inspectionDays != null) this.inspectionDays = Number(s.inspectionDays);
    });
  }

  // ===== Commission Breakdown =====
  get isAuction(): boolean {
    return this.projectData.listingType === 'auction';
  }
  get priceNumber(): number {
    const v = this.isAuction ? this.projectData.minBid : this.projectData.price;
    return Number(v) || 0;
  }
  get commissionAmount(): number {
    return Math.round(this.priceNumber * this.commissionPercentage / 100);
  }
  get sellerPayout(): number {
    return this.priceNumber - this.commissionAmount;
  }

  nextStep() {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number) {
    if (step <= this.currentStep || this.validateCurrentStep()) {
      this.currentStep = step;
    }
  }

  validateCurrentStep(): boolean {
    this.error = '';
    
    switch (this.currentStep) {
      case 1:
        if (!this.projectData.title) {
          this.error = 'الرجاء إدخال عنوان المشروع';
          return false;
        }
        if (!this.projectData.category) {
          this.error = 'الرجاء اختيار فئة المشروع';
          return false;
        }
        if (!this.projectData.shortDescription) {
          this.error = 'الرجاء إدخال وصف مختصر';
          return false;
        }
        if (!this.projectData.description) {
          this.error = 'الرجاء إدخال وصف تفصيلي';
          return false;
        }
        break;
      
      case 2:
        if (this.isAuction) {
          if (!this.projectData.minBid || this.projectData.minBid <= 0) {
            this.error = 'الرجاء إدخال الحد الأدنى للمزايدة';
            return false;
          }
          if (!this.projectData.auctionDurationDays || this.projectData.auctionDurationDays <= 0) {
            this.error = 'الرجاء اختيار مدة المزاد';
            return false;
          }
        } else {
          if (!this.projectData.price || this.projectData.price <= 0) {
            this.error = 'الرجاء إدخال السعر المطلوب';
            return false;
          }
        }
        break;
      
      case 3:
        // Optional step - no required fields
        break;
      
      case 4:
        // Media upload - optional for now
        break;
    }
    
    return true;
  }

  addTechStack() {
    if (this.techStackInput.trim()) {
      this.projectData.techStack.push(this.techStackInput.trim());
      this.techStackInput = '';
    }
  }

  removeTechStack(index: number) {
    this.projectData.techStack.splice(index, 1);
  }

  calculateAIValuation() {
    // Quick local hint while user types — keeps the legacy aiValuation field for any consumers.
    if (this.projectData.monthlyRevenue > 0) {
      this.aiValuation = this.projectData.monthlyRevenue * 24;
    }
  }

  runAIValuation() {
    this.valuationError = '';
    this.valuationLoading = true;
    this.valuationService
      .value({
        category: this.projectData.category,
        monthlyRevenue: Number(this.projectData.monthlyRevenue) || 0,
        monthlyProfit: Number(this.projectData.monthlyProfit) || 0,
        monthlyVisitors: Number(this.projectData.monthlyVisitors) || 0,
        activeUsers: Number(this.projectData.activeUsers) || 0,
        ageInMonths: Number(this.projectData.ageInMonths) || 0,
        monetizationType: this.projectData.monetizationType,
        techStack: this.projectData.techStack,
        description: this.projectData.shortDescription || this.projectData.description,
      })
      .subscribe({
        next: (res) => {
          this.valuationResult = res;
          this.valuationLoading = false;
        },
        error: (err) => {
          this.valuationLoading = false;
          this.valuationError = err.error?.message || 'تعذّر التقييم. حاول مجدّداً.';
        },
      });
  }

  applyValuation() {
    if (!this.valuationResult) return;
    if (this.isAuction) {
      this.projectData.minBid = this.valuationResult.fairPrice;
    } else {
      this.projectData.price = this.valuationResult.fairPrice;
    }
  }

  confidenceLabel(c: 'low' | 'medium' | 'high'): string {
    return c === 'high' ? 'عالية' : c === 'medium' ? 'متوسطة' : 'منخفضة';
  }

  saveDraft() {
    // TODO: Save to localStorage or API
    localStorage.setItem('project_draft', JSON.stringify(this.projectData));
    alert('تم حفظ المسودة بنجاح');
  }

  loadDraft() {
    const draft = localStorage.getItem('project_draft');
    if (draft) {
      this.projectData = JSON.parse(draft);
      alert('تم تحميل المسودة');
    }
  }

  onSubmit() {
    if (!this.validateCurrentStep()) {
      return;
    }

    // Compute auction end date for backend
    if (this.isAuction) {
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + Number(this.projectData.auctionDurationDays));
      this.projectData.auctionEndsAt = endsAt.toISOString();
      // For auction, set a placeholder price = minBid so backend has a price field
      if (!this.projectData.price || this.projectData.price <= 0) {
        this.projectData.price = Number(this.projectData.minBid);
      }
    } else {
      this.projectData.auctionEndsAt = null;
      this.projectData.minBid = 0;
    }

    this.loading = true;
    this.error = '';

    this.projectsService.createProject(this.projectData).subscribe({
      next: (response) => {
        this.loading = false;
        alert('✅ تم استلام طلبك بنجاح!\n\nالأصل دلوقتى بحالة "بانتظار المراجعة" - سيتم مراجعته من فريق الإدارة خلال 24-48 ساعة، وهتوصلك رسالة بالنتيجة.');
        localStorage.removeItem('project_draft');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'حدث خطأ أثناء إضافة المشروع';
        console.error('Error creating project:', err);
      }
    });
  }

  get progressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }
}
