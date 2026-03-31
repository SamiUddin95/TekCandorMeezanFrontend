import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InwardClearingReportItem {
  coreFTId: string | null;
  accountNumber: string;
  oldAccount: string;
  amount: number;
  approverId: string | null;
  chequeNumber: string;
  authorizerId: string | null;
  trProcORRecTime: string | null;
}

export interface InwardClearingReportListResponse {
  items: InwardClearingReportItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface InwardClearingReportApiResponse {
  status: string;
  data: InwardClearingReportListResponse;
  statusCode: number;
  errorMessage: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class InwardClearingReportService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getInwardClearingReport(
    pageNumber: number = 1,
    pageSize: number = 10,
    filters?: {
      dateFrom?: string;
      dateTo?: string;
      chequeNumber?: string;
      accountNumber?: string;
      branchId?: string;
      status?: string;
      hubId?: string;
    }
  ): Observable<InwardClearingReportApiResponse> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (filters) {
      if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
      if (filters.chequeNumber) params = params.set('chequeNumber', filters.chequeNumber);
      if (filters.accountNumber) params = params.set('accountNumber', filters.accountNumber);
      if (filters.branchId) params = params.set('branchId', filters.branchId);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.hubId) params = params.set('hubId', filters.hubId);
    }

    return this.http.get<InwardClearingReportApiResponse>(`${this.apiUrl}/Reports/InwardClearingReport`, { params });
  }
}
