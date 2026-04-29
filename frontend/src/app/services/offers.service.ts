import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Offer {
  id: string;
  projectId: string;
  buyerId: string;
  offerAmount: number;
  counterAmount?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  message?: string;
  rejectReason?: string;
  createdAt: string;
  project?: {
    id: string;
    title: string;
    price: number;
    mainImage?: string;
  };
  buyer?: { id: string; fullName: string };
}

@Injectable({ providedIn: 'root' })
export class OffersService {
  private apiUrl = `${environment.apiUrl}/offers`;

  constructor(private http: HttpClient) {}

  getMyOffers(type: 'sent' | 'received' = 'sent'): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.apiUrl}?type=${type}`);
  }

  acceptOffer(id: string): Observable<Offer> {
    return this.http.patch<Offer>(`${this.apiUrl}/${id}/accept`, {});
  }

  rejectOffer(id: string, reason: string): Observable<Offer> {
    return this.http.patch<Offer>(`${this.apiUrl}/${id}/reject`, { rejectReason: reason });
  }

  counterOffer(id: string, amount: number): Observable<Offer> {
    return this.http.patch<Offer>(`${this.apiUrl}/${id}/counter`, { counterAmount: amount });
  }

  withdrawOffer(id: string): Observable<Offer> {
    return this.http.patch<Offer>(`${this.apiUrl}/${id}/withdraw`, {});
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'قيد الانتظار',
      accepted: 'مقبول',
      rejected: 'مرفوض',
      withdrawn: 'مسحوب',
    };
    return labels[status] || status;
  }
}
