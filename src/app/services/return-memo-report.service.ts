import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ReturnMemoReportItem {
  accountNumber: string;
  chequeNumber: string;
  amount: number;
  accountTitle: string;
  cycleCode: string;
  returnreasone: string | null;
  date: string;
  senderBranchCode: string;
  receiverBranchCode: string;
}

export interface ReturnMemoReportListResponse {
  status: string;
  data: {
    items: ReturnMemoReportItem[];
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
export class ReturnMemoReportService {
  private apiUrl = `${environment.apiUrl}/Reports`;

  constructor(private http: HttpClient) {}

  getReturnMemoReport(
    pageNumber: number = 1, 
    pageSize: number = 10,
    fromDate?: string,
    toDate?: string,
    chequeNumber?: string,
    branch?: string,
    accountNumber?: string
  ): Observable<ReturnMemoReportListResponse> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }
    if (toDate) {
      params = params.set('toDate', toDate);
    }
    if (chequeNumber) {
      params = params.set('chequeNumber', chequeNumber);
    }
    if (branch) {
      params = params.set('branchCode', branch);
    }
    if (accountNumber) {
      params = params.set('accountNumber', accountNumber);
    }

    return this.http.get<ReturnMemoReportListResponse>(`${this.apiUrl}/ReturnMemoReport`, { params });
  }
}
