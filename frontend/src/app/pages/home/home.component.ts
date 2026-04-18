import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  heroStats = [
    { value: '500+', label: 'مشروع متاح' },
    { value: '2,000+', label: 'مستخدم نشط' },
    { value: '$5M+', label: 'قيمة الصفقات' }
  ];

  categories = [
    { icon: '🛒', name: 'تجارة إلكترونية', count: 124 },
    { icon: '💻', name: 'SaaS', count: 67 },
    { icon: '📱', name: 'تطبيقات', count: 89 },
    { icon: '📝', name: 'مواقع محتوى', count: 156 },
    { icon: '🎓', name: 'تعليم أونلاين', count: 43 },
    { icon: '🎮', name: 'ألعاب', count: 21 }
  ];

  recentSales = [
    { title: 'متجر مستحضرات تجميل', category: 'تجارة إلكترونية', price: '$65,000', time: 'منذ 3 أيام' },
    { title: 'تطبيق لياقة بدنية', category: 'تطبيقات موبايل', price: '$42,000', time: 'منذ 5 أيام' },
    { title: 'منصة تعليمية', category: 'تعليم أونلاين', price: '$180,000', time: 'منذ أسبوع' },
    { title: 'موقع حجوزات', category: 'خدمات', price: '$95,000', time: 'منذ أسبوعين' }
  ];

  salesStats = [
    { value: '$5.2M+', label: 'إجمالي الصفقات المكتملة' },
    { value: '350+', label: 'صفقة ناجحة' },
    { value: '98%', label: 'معدل رضا العملاء' }
  ];

  features = [
    { icon: '🔒', title: 'نظام الضمان (Escrow)', description: 'جميع الأموال محفوظة في حساب ضمان آمن حتى اكتمال نقل الملكية' },
    { icon: '🤖', title: 'تقييم بالذكاء الاصطناعي', description: 'محرك ذكي يحلل مشروعك ويعطيك تقييمًا عادلاً' },
    { icon: '✅', title: 'توثيق KYC آمن', description: 'نظام توثيق متقدم لضمان هوية جميع المستخدمين' },
    { icon: '📋', title: 'خطة نقل منظمة', description: 'قوائم تحقق تفصيلية لنقل الأصول الرقمية بسلاسة' },
    { icon: '⚖️', title: 'حل النزاعات', description: 'نظام تحكيم إلكتروني سريع وعادل' },
    { icon: '💳', title: 'دفع آمن ومتعدد', description: 'بوابات دفع محلية ودولية مع حماية كاملة' }
  ];

  steps = [
    { title: 'إنشاء حساب', description: 'سجل حسابك وقم بالتوثيق عبر KYC' },
    { title: 'تصفح أو أضف مشروع', description: 'ابحث عن المشروع المناسب أو أضف مشروعك للبيع' },
    { title: 'التفاوض والدفع', description: 'قدم عرضك وادفع عبر نظام الضمان' },
    { title: 'نقل الملكية', description: 'اتبع خطة النقل المنظمة لتسليم الأصول' },
    { title: 'استلام الأموال', description: 'البائع يستلم المبلغ بعد التأكيد' }
  ];

  testimonials = [
    { text: 'بعت متجري الإلكتروني بـ $75,000 خلال أسبوعين فقط! العملية كانت سلسة والدعم ممتاز.', name: 'محمد أحمد', initials: 'م أ', role: 'بائع - الرياض' },
    { text: 'اشتريت تطبيق توصيل ونظام الضمان أعطاني راحة بال كاملة. أنصح بشدة!', name: 'سارة العلي', initials: 'س ع', role: 'مشتري - جدة' },
    { text: 'منصة احترافية جداً. التقييم بالذكاء الاصطناعي ساعدني أحدد السعر العادل.', name: 'خالد محمود', initials: 'خ م', role: 'بائع - دبي' }
  ];
}
