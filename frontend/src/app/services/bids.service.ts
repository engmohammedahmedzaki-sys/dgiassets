import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Bid {
  id: string;
  amount: number;
  bidderName: string;
  createdAt: string;
}

export interface PlaceBidResponse {
  success: boolean;
  currentHighBid: number;
  bidCount: number;
  bidId: string;
}

@Injectable({ providedIn: 'root' })
export class BidsService {
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  placeBid(projectId: string, amount: number): Observable<PlaceBidResponse> {
    return this.http.post<PlaceBidResponse>(
      `${this.apiUrl}/${projectId}/bids`,
      { amount },
    );
  }

  getBids(projectId: string): Observable<Bid[]> {
    return this.http.get<Bid[]>(`${this.apiUrl}/${projectId}/bids`);
  }
}
