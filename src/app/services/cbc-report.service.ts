import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StatusOption {
  text: string;
  value: string;
}

export interface CBCReportItem {
  date: string;
  cycleCode: string;
  hubCode: string | null;
  coreFTId: string | null;
  amount: number;
  chequeNumber: string;
  senderBranchCode: string;
  accountNumber: string;
  iban: string | null;
  accountTitle: string;
  remarks: string | null;
  branchStaffId: string | null;
  cbcStatus: string | null;
}

export interface CBCReportListResponse {
  status: string;
  data: {
    items: CBCReportItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };
  statusCode: number;
  errorMessage: string | null;
}

export interface StatusFilterResponse {
  status: string;
  data: {
    statuses: StatusOption[];
  };
  statusCode: number;
  errorMessage: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CBCReportService {
  private apiUrl = `${environment.apiUrl}/Reports`;

  constructor(private http: HttpClient) {}

  getCBCReport(
    pageNumber: number = 1, 
    pageSize: number = 10,
    fromDate?: string,
    toDate?: string,
    branch?: number,
    accountNumber?: string,
    status?: string,
    hub?: number
  ): Observable<CBCReportListResponse> {
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
      params = params.set('branch', branch.toString());
    }
    if (accountNumber) {
      params = params.set('accountNumber', accountNumber);
    }
    if (status) {
      params = params.set('status', status);
    }
    if (hub) {
      params = params.set('hub', hub.toString());
    }

    return this.http.get<CBCReportListResponse>(`${this.apiUrl}/CBCReport`, { params });
  }

  getStatuses(): Observable<StatusFilterResponse> {
    return this.http.get<StatusFilterResponse>(`${environment.apiUrl}/Filter/status`);
  }
}
