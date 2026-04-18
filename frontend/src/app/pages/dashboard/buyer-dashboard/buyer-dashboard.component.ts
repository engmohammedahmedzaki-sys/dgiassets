import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

interface Activity {
  icon: string;
  title: string;
  description: string;
  time: string;
  status: string;
  color: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  revenue: string;
  users: string;
  price: number;
}

@Component({
  selector: 'app-buyer-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './buyer-dashboard.component.html',
  styleUrl: './buyer-dashboard.component.css'
})
export class BuyerDashboardComponent implements OnInit {
  menuItems = [
    { label: 'لوحة التحكم', icon: '🏠', route: '/dashboard/buyer' },
    { label: 'المشاريع المتابعة', icon: '⭐', route: '/dashboard/buyer/watchlist', badge: 3 },
    { label: 'عروضي', icon: '💼', route: '/dashboard/buyer/offers', badge: 2 },
    { label: 'المشاريع المشتراة', icon: '✅', route: '/dashboard/buyer/purchased' },
    { label: 'المعاملات', icon: '💳', route: '/dashboard/buyer/transactions' },
    { label: 'الإعدادات', icon: '⚙️', route: '/dashboard/buyer/settings' },
  ];

  stats = {
    watchlist: 3,
    offers: 2,
    purchased: 0,
    totalSpent: 0
  };

  recentActivity: Activity[] = [
    {
      icon: '👁️',
      title: 'أضفت مشروع للمتابعة',
      description: 'متجر إلكتروني للملابس',
      time: 'منذ ساعتين',
      status: 'info',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: '💼',
      title: 'قدمت عرض شراء',
      description: 'تطبيق توصيل الطعام - $15,000',
      time: 'منذ 5 ساعات',
      status: 'pending',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      icon: '📧',
      title: 'رسالة جديدة من البائع',
      description: 'رد على استفسارك عن المشروع',
      time: 'منذ يوم',
      status: 'success',
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
  ];

  watchlist: Project[] = [
    {
      id: '1',
      title: 'متجر إلكتروني للملابس',
      description: 'متجر متكامل مع نظام إدارة المخزون والشحن',
      image: 'https://via.placeholder.com/400x250',
      category: 'تجارة إلكترونية',
      revenue: '$5,000',
      users: '2,500',
      price: 25000
    },
    {
      id: '2',
      title: 'تطبيق توصيل الطعام',
      description: 'تطبيق جوال iOS و Android مع لوحة تحكم',
      image: 'https://via.placeholder.com/400x250',
      category: 'تطبيقات',
      revenue: '$3,000',
      users: '1,200',
      price: 18000
    },
    {
      id: '3',
      title: 'موقع تعليمي',
      description: 'منصة كورسات أونلاين مع نظام اشتراكات',
      image: 'https://via.placeholder.com/400x250',
      category: 'تعليم',
      revenue: '$2,500',
      users: '800',
      price: 15000
    }
  ];

  ngOnInit() {
    // Load user data and stats
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'قيد الانتظار',
      'success': 'مكتمل',
      'info': 'جديد',
      'warning': 'تحذير'
    };
    return statusMap[status] || status;
  }
}
