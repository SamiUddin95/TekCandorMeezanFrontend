import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReturnTransaction {
  id: number;
  date: string;
  senderBankCode: string;
  receiverBranchCode: string;
  chequeNumber: string;
  accountNumber: string;
  transactionCode: string;
  status: string;
  amount: number;
  accountBalance: string;
  accountStatus: string;
  currency: string | null;
  hubCode: string;
  cycleCode: string;
  instrumentNo: string;
  branchStatus: string | null;
  cbcStatus: string | null;
  error: boolean;
  export: boolean;
  returnReason?: string;
}

export interface ReturnTransactionResponse {
  items: ReturnTransaction[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReturnTransactionService {

  private baseUrl = 'https://localhost:44367/api/ChequeDeposit';

  constructor(private http: HttpClient) { }

  // Get all return transactions
  getReturnTransactions(filters: any): Observable<ReturnTransactionResponse> {
    let params = new HttpParams();
    
    if (filters.branch) params = params.set('branch', filters.branch);
    if (filters.accountNumber) params = params.set('accountNumber', filters.accountNumber);
    if (filters.chequeNumber) params = params.set('chequeNumber', filters.chequeNumber);
    if (filters.hub) params = params.set('hub', filters.hub);
    if (filters.resCore) params = params.set('resCore', filters.resCore);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.instrument) params = params.set('instrument', filters.instrument);
    if (filters.cycle) params = params.set('cycle', filters.cycle);
    if (filters.page) params = params.set('page', filters.page);
    if (filters.pageSize) params = params.set('pageSize', filters.pageSize);

    return this.http.get<ReturnTransactionResponse>(`${this.baseUrl}/ReturnList`, { params });
  }

  // Get branches
  getBranches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/branches`);
  }

  // Get hubs
  getHubs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/hubs`);
  }

  // Get status options
  getStatusOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/status-options`);
  }

  // Get instrument options
  getInstrumentOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/instrument-options`);
  }

  // Get cycle options
  getCycleOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/cycle-options`);
  }

  // Get return reason options
  getReturnReasonOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/return-reason-options`);
  }

  // Export data
  exportData(filters: any): Observable<any> {
    let params = new HttpParams();
    
    if (filters.branch) params = params.set('branch', filters.branch);
    if (filters.accountNumber) params = params.set('accountNumber', filters.accountNumber);
    if (filters.chequeNumber) params = params.set('chequeNumber', filters.chequeNumber);
    if (filters.hub) params = params.set('hub', filters.hub);
    if (filters.resCore) params = params.set('resCore', filters.resCore);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.instrument) params = params.set('instrument', filters.instrument);
    if (filters.cycle) params = params.set('cycle', filters.cycle);

    return this.http.get(`${this.baseUrl}/export-returns`, { params, responseType: 'blob' });
  }

  // Reversal function
  reversalTransaction(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/reversal/${id}`, {});
  }

  // Download file
  downloadFile(filters: any): Observable<any> {
    let params = new HttpParams();
    
    if (filters.branch) params = params.set('branch', filters.branch);
    if (filters.accountNumber) params = params.set('accountNumber', filters.accountNumber);
    if (filters.chequeNumber) params = params.set('chequeNumber', filters.chequeNumber);
    if (filters.hub) params = params.set('hub', filters.hub);
    if (filters.resCore) params = params.set('resCore', filters.resCore);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.instrument) params = params.set('instrument', filters.instrument);
    if (filters.cycle) params = params.set('cycle', filters.cycle);

    return this.http.get(`${this.baseUrl}/download-returns`, { params, responseType: 'blob' });
  }
}
