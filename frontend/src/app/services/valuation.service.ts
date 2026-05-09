import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ValuationInput {
  category?: string;
  monthlyRevenue?: number;
  monthlyProfit?: number;
  monthlyVisitors?: number;
  activeUsers?: number;
  ageInMonths?: number;
  monetizationType?: string;
  techStack?: string[];
  description?: string;
}

export interface ValuationResult {
  source: 'ai' | 'formula';
  fairPrice: number;
  rangeLow: number;
  rangeHigh: number;
  multiple: number;
  reasoning: string;
  confidence: 'low' | 'medium' | 'high';
}

@Injectable({ providedIn: 'root' })
export class ValuationService {
  private apiUrl = `${environment.apiUrl}/valuation`;

  constructor(private http: HttpClient) {}

  value(input: ValuationInput): Observable<ValuationResult> {
    return this.http.post<ValuationResult>(this.apiUrl, input);
  }
}
