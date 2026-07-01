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
    
    if (filters.branch) params = params.set('Branch', filters.branch);
  if (filters.accountNumber) params = params.set('AccountNumber', filters.accountNumber);
  if (filters.chequeNumber) params = params.set('ChequeNumber', filters.chequeNumber);
  if (filters.hub) params = params.set('HubCode', filters.hub);
  if (filters.resCore) params = params.set('ServiceRun', filters.resCore);
  if (filters.status) params = params.set('Status', filters.status);
  if (filters.instrument) params = params.set('InstrumentNo', filters.instrument);
  if (filters.cycle) params = params.set('CycleCode', filters.cycle);
  if (filters.page) params = params.set('Page', filters.page);
  if (filters.pageSize) params = params.set('PageSize', filters.pageSize);

    return this.http.get<BranchReturnConfirmationResponse>(`${this.apiUrl}/ChequeDeposit/BranchReturnList`, { params });
  }

  // Get branch return confirmation details by ID
  getBranchReturnConfirmationDetails(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/ChequeDeposit/${id}/branch-return-edit`);
  }

  
  // Get posting restriction options
  getPostingRestrictionOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/posting-restriction-options`);
  }

}
