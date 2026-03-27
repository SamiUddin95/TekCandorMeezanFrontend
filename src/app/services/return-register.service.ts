import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ReturnRegisterItem {
  accountNumber: string;
  chequeNumber: string;
  amount: number;
  accountTitle: string;
  receiverBranchCode: string;
  cycleCode: string;
  senderBankCode: string;
  approverId: string;
  coreFTId: string | null;
  trProcORRecTime: string;
}

export interface ReturnRegisterListResponse {
  status: string;
  data: {
    items: ReturnRegisterItem[];
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
export class ReturnRegisterService {
  private apiUrl = `${environment.apiUrl}/Reports`;

  constructor(private http: HttpClient) {}

  getReturnRegisterReport(
    pageNumber: number = 1, 
    pageSize: number = 10,
    accountNumber?: string,
    branch?: number,
    fromDate?: string,
    toDate?: string,
    status?: string,
    cycle?: number
  ): Observable<ReturnRegisterListResponse> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (accountNumber) {
      params = params.set('accountNumber', accountNumber);
    }
    if (branch) {
      params = params.set('branch', branch.toString());
    }
    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }
    if (toDate) {
      params = params.set('toDate', toDate);
    }
    if (status) {
      params = params.set('status', status);
    }
    if (cycle) {
      params = params.set('cycle', cycle.toString());
    }

    return this.http.get<ReturnRegisterListResponse>(`${this.apiUrl}/ReturnRegisterReport`, { params });
  }
}
