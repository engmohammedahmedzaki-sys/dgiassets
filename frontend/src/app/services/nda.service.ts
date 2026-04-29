import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NdaService {
  private apiUrl = `${environment.apiUrl}/nda`;

  constructor(private http: HttpClient) {}

  sign(projectId: string): Observable<{ success: boolean; signedAt: string }> {
    return this.http.post<{ success: boolean; signedAt: string }>(
      `${this.apiUrl}/sign/${projectId}`,
      {},
    );
  }

  getStatus(projectId: string): Observable<{ signed: boolean }> {
    return this.http.get<{ signed: boolean }>(`${this.apiUrl}/status/${projectId}`);
  }
}
