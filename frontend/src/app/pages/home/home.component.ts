import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjectsService, Project } from '../../services/projects.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  featuredProjects: Project[] = [];
  recentSales: Project[] = [];
  loading = true;
  totalProjectsCount = 0;

  heroStats = [
    { value: '0', label: 'أصل متاح', key: 'projects' },
    { value: '0', label: 'مستخدم', key: 'users' },
    { value: '0', label: 'صفقة مكتملة', key: 'deals' },
  ];

  categories = [
    { icon: '🌐', name: 'الدومينات', value: 'domains' },
    { icon: '💻', name: 'مواقع', value: 'websites' },
    { icon: '🛒', name: 'متاجر إلكترونية', value: 'ecommerce' },
    { icon: '📱', name: 'تطبيقات', value: 'apps' },
    { icon: '☁️', name: 'SaaS', value: 'saas' },
    { icon: '👥', name: 'حسابات رقمية', value: 'accounts' },
    { icon: '📚', name: 'محتوى رقمى', value: 'content' },
    { icon: '🏷️', name: 'علامات تجارية', value: 'brands' },
    { icon: '🎮', name: 'ألعاب', value: 'games' },
    { icon: '📊', name: 'قواعد بيانات', value: 'databases' },
    { icon: '💡', name: 'ملكية فكرية', value: 'ip' },
    { icon: '🔧', name: 'خدمات رقمية', value: 'services' },
  ];

  features = [
    { icon: '🔒', title: 'نظام الضمان (Escrow)', description: 'الأموال محفوظة فى حساب ضمان آمن حتى اكتمال نقل الأصل' },
    { icon: '🤖', title: 'تقييم بالذكاء الاصطناعى', description: 'محرك تقييم ذكى يعطيك نطاق سعرى عادل لأصلك' },
    { icon: '✅', title: 'توثيق KYC', description: 'نظام توثيق متقدّم لضمان هوية البائع والمشترى' },
    { icon: '📋', title: 'خطة نقل منظمة', description: 'قوائم تحقق تفصيلية حسب نوع الأصل (دومين، استضافة، حسابات)' },
    { icon: '⚖️', title: 'حل النزاعات', description: 'تحكيم إلكترونى سريع خلال 72 ساعة إلى 7 أيام' },
    { icon: '💳', title: 'دفع آمن', description: 'بوابات دفع محلية ودولية مع حماية كاملة' }
  ];

  steps = [
    { title: 'سجّل وفعّل حسابك', description: 'إنشاء حساب وتوثيق هوية عبر KYC' },
    { title: 'تصفح أو أضف أصل', description: 'ابحث عن الأصل المناسب أو اعرض أصلك للبيع' },
    { title: 'تفاوض وادفع بضمان', description: 'قدّم عرضك وادفع عبر حساب الضمان' },
    { title: 'استلم أو سلّم', description: 'اتبع قائمة نقل الأصل خطوة بخطوة' },
    { title: 'تحويل آمن للمبلغ', description: 'البائع يستلم المبلغ بعد تأكيد الاستلام' }
  ];

  constructor(
    private projectsService: ProjectsService,
    public router: Router,
  ) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.loading = true;
    this.projectsService.getProjects({ limit: 8 }).subscribe({
      next: (res) => {
        this.featuredProjects = res.projects.slice(0, 4);
        this.recentSales = res.projects.slice(4, 8);
        this.totalProjectsCount = res.total;
        this.heroStats[0].value = res.total > 0 ? `${res.total}+` : '0';
        this.loading = false;
      },
      error: () => {
        this.featuredProjects = [];
        this.recentSales = [];
        this.loading = false;
      }
    });
  }

  goToProject(id: string) {
    this.router.navigate(['/projects', id]);
  }

  formatPrice(price: number): string {
    if (!price) return '—';
    if (price >= 1000000) return (price / 1000000).toFixed(1) + 'M ر.س';
    if (price >= 1000) return (price / 1000).toFixed(0) + 'K ر.س';
    return price.toLocaleString('en-US') + ' ر.س';
  }

  categoryLabel(value: string): string {
    const c = this.categories.find(c => c.value === value);
    return c?.name || value;
  }
}
