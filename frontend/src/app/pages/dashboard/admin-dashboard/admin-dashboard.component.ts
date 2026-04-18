import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Project {
  id: string;
  title: string;
  category: string;
  price: number;
  status: string;
  owner: any;
  createdAt: string;
  viewCount: number;
  offerCount: number;
}

interface Stats {
  totalProjects: number;
  totalUsers: number;
  totalOffers: number;
  totalRevenue: number;
  activeProjects: number;
  soldProjects: number;
  pendingProjects: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  projects: Project[] = [];
  stats: Stats = {
    totalProjects: 0,
    totalUsers: 0,
    totalOffers: 0,
    totalRevenue: 0,
    activeProjects: 0,
    soldProjects: 0,
    pendingProjects: 0
  };
  
  selectedTab: 'overview' | 'projects' | 'users' | 'offers' = 'overview';
  loading = false;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadStats();
    this.loadProjects();
  }

  loadStats() {
    this.http.get<any>(`${environment.apiUrl}/admin/stats`).subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        // Use mock data for now
        this.stats = {
          totalProjects: 25,
          totalUsers: 150,
          totalOffers: 45,
          totalRevenue: 2500000,
          activeProjects: 18,
          soldProjects: 7,
          pendingProjects: 0
        };
      }
    });
  }

  loadProjects() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/projects`).subscribe({
      next: (data) => {
        this.projects = data.projects || data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading projects:', err);
        this.error = 'حدث خطأ في تحميل المشاريع';
        this.loading = false;
      }
    });
  }

  deleteProject(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
      return;
    }

    this.http.delete(`${environment.apiUrl}/admin/projects/${id}`).subscribe({
      next: () => {
        this.projects = this.projects.filter(p => p.id !== id);
        alert('تم حذف المشروع بنجاح');
      },
      error: (err) => {
        console.error('Error deleting project:', err);
        alert('حدث خطأ في حذف المشروع');
      }
    });
  }

  approveProject(id: string) {
    this.http.patch(`${environment.apiUrl}/admin/projects/${id}/approve`, {}).subscribe({
      next: () => {
        const project = this.projects.find(p => p.id === id);
        if (project) {
          project.status = 'active';
        }
        alert('تم الموافقة على المشروع');
      },
      error: (err) => {
        console.error('Error approving project:', err);
        alert('حدث خطأ في الموافقة على المشروع');
      }
    });
  }

  rejectProject(id: string) {
    if (!confirm('هل أنت متأكد من رفض هذا المشروع؟')) {
      return;
    }

    this.http.patch(`${environment.apiUrl}/admin/projects/${id}/reject`, {}).subscribe({
      next: () => {
        const project = this.projects.find(p => p.id === id);
        if (project) {
          project.status = 'rejected';
        }
        alert('تم رفض المشروع');
      },
      error: (err) => {
        console.error('Error rejecting project:', err);
        alert('حدث خطأ في رفض المشروع');
      }
    });
  }

  selectTab(tab: 'overview' | 'projects' | 'users' | 'offers') {
    this.selectedTab = tab;
  }

  getStatusBadgeClass(status: string): string {
    switch(status) {
      case 'active': return 'badge-success';
      case 'sold': return 'badge-warning';
      case 'pending': return 'badge-info';
      case 'rejected': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  getStatusText(status: string): string {
    switch(status) {
      case 'active': return 'نشط';
      case 'sold': return 'مباع';
      case 'pending': return 'قيد المراجعة';
      case 'rejected': return 'مرفوض';
      default: return status;
    }
  }

  getCategoryText(category: string): string {
    const categories: any = {
      'ecommerce': 'التجارة الإلكترونية',
      'saas': 'SaaS',
      'mobile': 'تطبيقات الجوال',
      'website': 'مواقع الويب',
      'ai': 'الذكاء الاصطناعي',
      'other': 'أخرى'
    };
    return categories[category] || category;
  }
}
