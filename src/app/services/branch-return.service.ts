import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';

export interface BranchReturnConfirmation {
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
  postingRestriction?: string;
  accountTitle?: string;
}

export interface BranchReturnConfirmationResponse {
  items: BranchReturnConfirmation[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class BranchReturnService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Get all branch return confirmations
  getBranchReturnConfirmations(filters: any): Observable<BranchReturnConfirmationResponse> {
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

    return this.http.get<BranchReturnConfirmationResponse>(`${this.apiUrl}/ChequeDeposit/BranchReturnList`, { params });
  }

  // Get branch return confirmation details by ID
  getBranchReturnConfirmationDetails(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/branch-return-details/${id}`);
  }

  // Get branches
  getBranches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/branches`);
  }

  // Get hubs
  getHubs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/hubs`);
  }

  // Get status options
  getStatusOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/status-options`);
  }

  // Get instrument options
  getInstrumentOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/instrument-options`);
  }

  // Get cycle options
  getCycleOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cycle-options`);
  }

  // Get posting restriction options
  getPostingRestrictionOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/posting-restriction-options`);
  }

}
