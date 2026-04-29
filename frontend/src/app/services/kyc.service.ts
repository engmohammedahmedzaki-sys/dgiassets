import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type KycDocumentType = 'national_id' | 'passport' | 'commercial_register';
export type KycDocumentStatus = 'pending' | 'approved' | 'rejected';

export interface KycDocument {
  id: string;
  userId: string;
  documentType: KycDocumentType;
  documentUrl: string;
  backImageUrl: string | null;
  status: KycDocumentStatus;
  rejectionReason: string | null;
  reviewedByAdminId: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; fullName: string; email: string };
}

@Injectable({ providedIn: 'root' })
export class KycService {
  private apiUrl = `${environment.apiUrl}/kyc`;

  constructor(private http: HttpClient) {}

  submitDocument(documentType: KycDocumentType, frontFile: File, backFile?: File): Observable<KycDocument> {
    const fd = new FormData();
    fd.append('documentType', documentType);
    fd.append('documents', frontFile);
    if (backFile) fd.append('documents', backFile);
    return this.http.post<KycDocument>(`${this.apiUrl}/submit`, fd);
  }

  getMyDocuments(): Observable<KycDocument[]> {
    return this.http.get<KycDocument[]>(`${this.apiUrl}/my-documents`);
  }

  // Admin
  getPendingDocuments(): Observable<KycDocument[]> {
    return this.http.get<KycDocument[]>(`${this.apiUrl}/pending`);
  }

  approveDocument(id: string): Observable<KycDocument> {
    return this.http.patch<KycDocument>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectDocument(id: string, reason: string): Observable<KycDocument> {
    return this.http.patch<KycDocument>(`${this.apiUrl}/${id}/reject`, { reason });
  }

  documentTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      national_id: 'الهوية الوطنية',
      passport: 'جواز السفر',
      commercial_register: 'السجل التجارى',
    };
    return labels[type] || type;
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'قيد المراجعة',
      approved: 'موثّق ✅',
      rejected: 'مرفوض',
    };
    return labels[status] || status;
  }
}
