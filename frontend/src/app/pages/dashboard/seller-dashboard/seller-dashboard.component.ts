import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

interface Listing {
  id: string;
  title: string;
  shortDesc: string;
  image: string;
  category: string;
  price: number;
  views: number;
  offers: number;
  status: string;
}

interface Offer {
  id: string;
  buyerName: string;
  buyerInitials: string;
  projectTitle: string;
  amount: number;
  message: string;
  time: string;
}

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './seller-dashboard.component.html',
  styleUrl: './seller-dashboard.component.css'
})
export class SellerDashboardComponent implements OnInit {
  menuItems = [
    { label: 'لوحة التحكم', icon: '🏠', route: '/dashboard/seller' },
    { label: 'مشاريعي', icon: '📊', route: '/dashboard/seller/listings' },
    { label: 'العروض المعلقة', icon: '💼', route: '/dashboard/seller/offers', badge: 3 },
    { label: 'المبيعات', icon: '✅', route: '/dashboard/seller/sales' },
    { label: 'المعاملات', icon: '💳', route: '/dashboard/seller/transactions' },
    { label: 'الإعدادات', icon: '⚙️', route: '/dashboard/seller/settings' },
  ];

  stats = {
    activeListings: 5,
    pendingOffers: 3,
    soldProjects: 2,
    totalEarnings: 45000
  };

  myListings: Listing[] = [
    {
      id: '1',
      title: 'متجر إلكتروني للملابس',
      shortDesc: 'متجر كامل مع نظام إدارة',
      image: 'https://via.placeholder.com/80',
      category: 'تجارة إلكترونية',
      price: 25000,
      views: 156,
      offers: 3,
      status: 'active'
    },
    {
      id: '2',
      title: 'تطبيق توصيل الطعام',
      shortDesc: 'تطبيق iOS و Android',
      image: 'https://via.placeholder.com/80',
      category: 'تطبيقات',
      price: 18000,
      views: 89,
      offers: 2,
      status: 'active'
    },
    {
      id: '3',
      title: 'موقع تعليمي',
      shortDesc: 'منصة كورسات أونلاين',
      image: 'https://via.placeholder.com/80',
      category: 'تعليم',
      price: 15000,
      views: 67,
      offers: 0,
      status: 'pending'
    }
  ];

  pendingOffers: Offer[] = [
    {
      id: '1',
      buyerName: 'محمد أحمد',
      buyerInitials: 'م أ',
      projectTitle: 'متجر إلكتروني للملابس',
      amount: 24000,
      message: 'مهتم بالشراء، هل يمكن خصم صغير؟',
      time: 'منذ ساعتين'
    },
    {
      id: '2',
      buyerName: 'علي سعيد',
      buyerInitials: 'ع س',
      projectTitle: 'تطبيق توصيل الطعام',
      amount: 18000,
      message: 'عرض بالسعر الكامل، جاهز للبدء',
      time: 'منذ 5 ساعات'
    },
    {
      id: '3',
      buyerName: 'فاطمة خالد',
      buyerInitials: 'ف خ',
      projectTitle: 'متجر إلكتروني للملابس',
      amount: 23000,
      message: 'أريد مناقشة التفاصيل',
      time: 'منذ يوم'
    }
  ];

  ngOnInit() {
    // Load seller data
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'نشط',
      'pending': 'قيد المراجعة',
      'sold': 'مباع',
      'draft': 'مسودة'
    };
    return statusMap[status] || status;
  }
}
