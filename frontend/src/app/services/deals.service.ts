import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Deal {
  id: string;
  offerId: string;
  projectId: string;
  buyerId: string;
  sellerId: string;
  finalAmount: number;
  status: DealStatus;
  inspectionDeadline: string | null;
  transferNotes: string | null;
  disputeReason: string | null;
  project: { id: string; title: string; mainImage: string };
  offer: { offerAmount: number; counterAmount: number };
  createdAt: string;
}

export type DealStatus =
  | 'initiated'
  | 'payment_pending'
  | 'paid'
  | 'transfer_started'
  | 'inspection'
  | 'completed'
  | 'disputed'
  | 'refunded'
  | 'cancelled';

export interface CreateDealResponse {
  deal: Deal;
  paymentUrl: string;
}

@Injectable({ providedIn: 'root' })
export class DealsService {
  private apiUrl = `${environment.apiUrl}/deals`;

  constructor(private http: HttpClient) {}

  createDeal(offerId: string): Observable<CreateDealResponse> {
    return this.http.post<CreateDealResponse>(this.apiUrl, { offerId });
  }

  getMyDeals(): Observable<Deal[]> {
    return this.http.get<Deal[]>(this.apiUrl);
  }

  getDeal(id: string): Observable<Deal> {
    return this.http.get<Deal>(`${this.apiUrl}/${id}`);
  }

  confirmPayment(dealId: string, moyasarId: string): Observable<Deal> {
    return this.http.post<Deal>(`${this.apiUrl}/${dealId}/confirm-payment`, {
      moyasarId,
    });
  }

  startTransfer(dealId: string, notes?: string): Observable<Deal> {
    return this.http.patch<Deal>(`${this.apiUrl}/${dealId}/start-transfer`, {
      transferNotes: notes,
    });
  }

  completeDeal(dealId: string): Observable<Deal> {
    return this.http.patch<Deal>(`${this.apiUrl}/${dealId}/complete`, {});
  }

  openDispute(dealId: string, reason: string): Observable<Deal> {
    return this.http.patch<Deal>(`${this.apiUrl}/${dealId}/dispute`, {
      reason,
    });
  }

  getStatusLabel(status: DealStatus): string {
    const labels: Record<DealStatus, string> = {
      initiated: 'تم الإنشاء',
      payment_pending: 'في انتظار الدفع',
      paid: 'تم الدفع',
      transfer_started: 'جاري نقل الملكية',
      inspection: 'فترة الفحص',
      completed: 'مكتملة',
      disputed: 'نزاع',
      refunded: 'تم الاسترداد',
      cancelled: 'ملغية',
    };
    return labels[status] ?? status;
  }

  getStatusStep(status: DealStatus): number {
    const steps: Record<DealStatus, number> = {
      initiated: 0,
      payment_pending: 1,
      paid: 2,
      transfer_started: 3,
      inspection: 4,
      completed: 5,
      disputed: -1,
      refunded: -1,
      cancelled: -1,
    };
    return steps[status] ?? 0;
  }
}
