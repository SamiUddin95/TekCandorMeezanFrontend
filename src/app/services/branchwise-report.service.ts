import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BranchwiseReportItem {
  chequeNumber: string;
  accountNumber: string;
  accountTitle: string;
  amount: number;
  returnReason: string | null;
  hubCode: string | null;
  cycleCode: string | null;
  receiverBranchCode: string | null;
  transactionCode: string | null;
}

export interface BranchwiseReportListResponse {
  status: string;
  data: {
    items: BranchwiseReportItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };
  statusCode: number;
  errorMessage: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class BranchwiseReportService {
  private apiUrl = `${environment.apiUrl}/Reports`;

  constructor(private http: HttpClient) {}

  getBranchwiseReport(
    pageNumber: number = 1, 
    pageSize: number = 10,
    fromDate?: string,
    toDate?: string,
    branch?: string
  ): Observable<BranchwiseReportListResponse> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }
    if (toDate) {
      params = params.set('toDate', toDate);
    }
    if (branch) {
      params = params.set('branch', branch);
    }

    return this.http.get<BranchwiseReportListResponse>(`${this.apiUrl}/BranchWiseReport`, { params });
  }
}
