import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardChequeItem {
  status: string;
  cheques: number;
  amount: number;
}

export interface DashboardItems {
  normal: DashboardChequeItem[];
  sameDay: DashboardChequeItem[];
}

export interface DashboardResponse {
  status: string;
  data: {
    items: DashboardItems;
  };
  statusCode: number;
  errorMessage: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/Dashboard`;

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/dashboard`);
  }
}
