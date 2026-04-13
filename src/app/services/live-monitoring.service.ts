import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MonitoringRecord {
  records: string;
  count: number;
}

export interface LiveMonitoringData {
  monitoring: MonitoringRecord[];
  signatures: MonitoringRecord[];
}

export interface LiveMonitoringResponse {
  status: string;
  data: LiveMonitoringData;
  statusCode: number;
  errorMessage: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class LiveMonitoringService {
  private apiUrl = `${environment.apiUrl}/LiveMonitoring`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getMonitoringData(): Observable<LiveMonitoringResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<LiveMonitoringResponse>(`${this.apiUrl}/monitoring`, { headers });
  }
}
