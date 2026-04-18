import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  stats = [
    { icon: '💼', value: '500+', label: 'مشروع مباع' },
    { icon: '👥', value: '1000+', label: 'عميل راضٍ' },
    { icon: '💰', value: '$50M+', label: 'قيمة المعاملات' },
    { icon: '⭐', value: '4.9', label: 'تقييم العملاء' }
  ];

  features = [
    {
      icon: '🔒',
      title: 'أمان تام',
      description: 'نظام ضمان كامل (Escrow) لحماية البائع والمشتري'
    },
    {
      icon: '⚡',
      title: 'سرعة في الإنجاز',
      description: 'معاملات سريعة وآمنة مع فريق دعم متاح 24/7'
    },
    {
      icon: '🎯',
      title: 'شفافية كاملة',
      description: 'جميع التفاصيل واضحة ولا توجد رسوم خفية'
    },
    {
      icon: '🤝',
      title: 'ثقة متبادلة',
      description: 'نظام تقييمات ومراجعات موثوق'
    }
  ];

  team = [
    {
      name: 'محمد أحمد',
      role: 'المؤسس والمدير التنفيذي',
      image: 'https://ui-avatars.com/api/?name=Mohammed+Ahmed&background=2c3e50&color=fff&size=200'
    },
    {
      name: 'سارة علي',
      role: 'مديرة العمليات',
      image: 'https://ui-avatars.com/api/?name=Sara+Ali&background=16a085&color=fff&size=200'
    },
    {
      name: 'أحمد خالد',
      role: 'مدير التقنية',
      image: 'https://ui-avatars.com/api/?name=Ahmed+Khaled&background=e74c3c&color=fff&size=200'
    }
  ];
}
