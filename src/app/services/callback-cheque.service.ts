import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CallbackCheque {
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
}

export interface CallbackChequeResponse {
  items: CallbackCheque[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class CallbackChequeService {

  private baseUrl = 'https://localhost:44367/api/ChequeDeposit';

  constructor(private http: HttpClient) { }

  // Get all callback cheques with filters
  getCallbackCheques(filters: any): Observable<CallbackChequeResponse> {
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

    return this.http.get<CallbackChequeResponse>(`${this.baseUrl}/callbackList`, { params });
  }

  // Get callback cheque details by ID
  getCallbackChequeDetails(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  // Update callback cheque
  updateCallbackCheque(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
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

  // Get CBC status options
  getCbcStatusOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/cbc-status-options`);
  }

  // Hardcoded methods for now (will be replaced with actual API calls)
  getCallbackChequesHardcoded(filters: any): Observable<any> {
    // Mock data for development
    const mockData = {
      data: [
        {
          id: 1,
          receiverBranchCode: '001',
          cycleCode: 'CYCLE1',
          instrumentNo: 'INST1',
          chequeNumber: '12345678',
          accountNumber: '1234567890123456',
          amount: 5000,
          status: 'PENDING',
          cbcStatus: 'PENDING',
          branchStatus: 'PENDING',
          accountBalance: '15000.00',
          selected: false
        },
        {
          id: 2,
          receiverBranchCode: '002',
          cycleCode: 'CYCLE2',
          instrumentNo: 'INST2',
          chequeNumber: '87654321',
          accountNumber: '9876543210987654',
          amount: 7500,
          status: 'PROCESSING',
          cbcStatus: 'PROCESSING',
          branchStatus: 'PROCESSING',
          accountBalance: '25000.00',
          selected: false
        }
      ],
      totalRecords: 2,
      currentPage: 1,
      pageSize: 10
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(mockData);
        observer.complete();
      }, 500);
    });
  }

  getCallbackChequeDetailsHardcoded(id: number): Observable<any> {
    const mockDetails = {
      id: id,
      chequeNumber: '12345678',
      amount: '5000.00',
      status: 'PENDING',
      accountNumber: '1234567890123456',
      accountTitle: 'John Doe',
      accountBalance: '15000.00',
      cbcStatus: 'PENDING',
      errorInFields: 'Signature mismatch',
      imgF: 'cheque-front-image',
      imgR: 'cheque-back-image',
      customerSignature: 'customer-signature-data',
      bankSignature: 'bank-signature-data'
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(mockDetails);
        observer.complete();
      }, 300);
    });
  }
}
