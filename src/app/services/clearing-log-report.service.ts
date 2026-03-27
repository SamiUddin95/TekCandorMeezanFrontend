import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ClearingLogReportItem {
  coreFTId: string;
  accountNumber: string;
  oldAccount: string;
  amount: number;
  approverId: string;
  chequeNumber: string;
  authorizerId: string | null;
  receiverBankCode: string;
  receiverBranchCode: string;
  branchStaffId: string | null;
  remarks: string | null;
  cityCode: string;
  trProcORRecTime: string;
  senderBranchCode: string;
  trRecTimeBranch: string | null;
  branchRemarks: string | null;
}

export interface ClearingLogReportListResponse {
  status: string;
  data: {
    items: ClearingLogReportItem[];
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
export class ClearingLogReportService {
  private apiUrl = `${environment.apiUrl}/Reports`;

  constructor(private http: HttpClient) {}

  getClearingLogReport(
    pageNumber: number = 1, 
    pageSize: number = 10,
    fromDate?: string,
    toDate?: string,
    hub?: number,
    cycle?: number
  ): Observable<ClearingLogReportListResponse> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }
    if (toDate) {
      params = params.set('toDate', toDate);
    }
    if (hub) {
      params = params.set('hub', hub.toString());
    }
    if (cycle) {
      params = params.set('cycle', cycle.toString());
    }

    return this.http.get<ClearingLogReportListResponse>(`${this.apiUrl}/ClearingLogReport`, { params });
  }
}
