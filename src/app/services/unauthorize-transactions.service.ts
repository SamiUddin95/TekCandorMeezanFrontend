import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UnauthorizeTransaction {
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
  accountTitle: string;
  accountStatus: string;
  currency: string | null;
  hubCode: string;
  cycleCode: string;
  instrumentNo: string;
  branchStatus: string | null;
  cbcStatus: string | null;
  error: boolean;
  export: boolean;
  returnReason: string | null;
  postRestriction: string | null;
  selected?: boolean;
}

export interface UnauthorizeTransactionResponse {
  items: UnauthorizeTransaction[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class UnauthorizeTransactionsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Get unauthorize transactions list
  getUnauthorizeTransactions(filters: any): Observable<UnauthorizeTransactionResponse> {
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

    return this.http.get<UnauthorizeTransactionResponse>(`${this.apiUrl}/ChequeDeposit/UnAuthorizeList`, { params });
  }

  // Get unauthorize transaction details by ID
  getUnauthorizeTransactionDetails(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/ChequeDeposit/${id}/authorizer-edit`);
  }

  
  // Get res core options
  getResCoreOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/res-core-options`);
  }

  // Get CBC status options
  getCbcStatusOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cbc-status-options`);
  }

  // Get branch status options
  getBranchStatusOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/branch-status-options`);
  }
}
