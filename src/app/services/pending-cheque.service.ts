import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PendingChequeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Get auth headers
  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Get branches API
  getBranches(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ChequeDeposit/branches`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Get hubs API
  getHubs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ChequeDeposit/hubs`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Get pending cheques API
  getPendingCheques(filters: any): Observable<any> {
    const queryParams = new URLSearchParams();
    
    if (filters.branchCode) queryParams.append('branchCode', filters.branchCode);
    if (filters.accountNumber) queryParams.append('accountNumber', filters.accountNumber);
    if (filters.amount) queryParams.append('amount', filters.amount);
    if (filters.chequeNumber) queryParams.append('chequeNumber', filters.chequeNumber);
    if (filters.hub) queryParams.append('hub', filters.hub);
    if (filters.resCore) queryParams.append('resCore', filters.resCore);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.instrument) queryParams.append('instrument', filters.instrument);
    if (filters.cycle) queryParams.append('cycle', filters.cycle);
    queryParams.append('pageNumber', filters.pageNumber.toString());
    queryParams.append('pageSize', filters.pageSize.toString());

    return this.http.get(`${this.apiUrl}/ChequeDeposit/list?${queryParams.toString()}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Get cheque details API
  getChequeDetails(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/ChequeDeposit/pending-cheques/${id}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Update cheque status API
  updateChequeStatus(id: number, status: string, remarks?: string): Observable<any> {
    const payload = {
      status: status,
      remarks: remarks || '',
      updatedBy: this.getCurrentUserName()
    };

    return this.http.put(`${this.apiUrl}/ChequeDeposit/pending-cheques/${id}/status`, payload, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Approve cheque API
  approveCheque(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/ChequeDeposit/pending-cheques/${id}/approve`, {
      approvedBy: this.getCurrentUserName()
    }, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Reverse cheque API
  reverseCheque(id: number, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/ChequeDeposit/pending-cheques/${id}/reverse`, {
      reason: reason,
      reversedBy: this.getCurrentUserName()
    }, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Get current user from session storage
  private getCurrentUserName(): string {
    try {
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.username || user.email || user.name || 'Unknown';
      }
    } catch (error) {
      console.error('Error getting user from session storage:', error);
    }
    return 'Unknown';
  }
}

// Interfaces for type safety
export interface PendingChequeRecord {
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
  branchRemarks: string | null;
  error: boolean;
  callbacksend: string | null;
  export: boolean;
  selected?: boolean;
}

export interface Branch {
  code: string;
  name: string;
  address?: string;
  city?: string;
}

export interface Hub {
  code: string;
  name: string;
  location?: string;
}
