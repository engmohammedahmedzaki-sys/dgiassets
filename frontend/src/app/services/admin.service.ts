import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminStats {
  totalProjects: number;
  activeProjects: number;
  pendingProjects: number;
  soldProjects: number;
  totalUsers: number;
  verifiedUsers: number;
  totalOffers: number;
  pendingOffers: number;
  totalDeals: number;
  completedDeals: number;
  totalRevenue: number;
  recentProjects: Array<{
    id: string;
    title: string;
    price: number;
    status: string;
    createdAt: string;
  }>;
  recentDeals: any[];
  revenueByMonth: Array<{ month: string; revenue: number }>;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/stats`);
  }

  getAllProjects(): Observable<{ projects: any[]; total: number }> {
    return this.http.get<{ projects: any[]; total: number }>(`${this.apiUrl}/projects`);
  }

  approveProject(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/projects/${id}/approve`, {});
  }

  rejectProject(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/projects/${id}/reject`, {});
  }

  deleteProject(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/projects/${id}`);
  }
}
