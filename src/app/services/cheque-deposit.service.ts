import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export interface ImportDetail {
  id: number;
  importDataId: number;
  data: string;
  date: string;
  error: boolean;
  errorDescription: string;
}

export interface ImportRecord {
  id: number;
  fileName: string;
  date: string;  // Changed from importDate to date
  totalRecords: number;
  successfullRecords: number;  // Changed from successfulRecords to successfullRecords (with double 'l')
  failureRecords: number;
  status: string;
  details?: ImportDetail[];  // Optional details from API
}

export interface ChequeDepositResponse {
  status: string;
  data: {
    items: ImportRecord[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  } | ImportRecord | string;
  statusCode: number;
  errorMessage: string | null;
}

export interface ImportHistoryResponse {
  status: string;
  data: {
    items: ImportRecord[];
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
export class ChequeDepositService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('access_token');
    return new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private getCurrentUserName(): string {
    try {
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('User object from session storage:', user);
        const userName = user.name || user.loginName || 'Unknown';
        console.log('Extracted user name:', userName);
        return userName;
      }
    } catch (error) {
      console.error('Error getting user from session storage:', error);
    }
    return 'Unknown';
  }

uploadFile(file: File): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);

  console.log('Upload attempt:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    url: `${this.apiUrl}/ChequeDeposit/upload`,
    token: sessionStorage.getItem('access_token') ? 'Token exists' : 'No token'
  });

  return this.http.post(
    `${this.apiUrl}/ChequeDeposit/upload`,
    formData
  );
}
 
  importFile(): Observable<any> {
    return this.http.post(`${this.apiUrl}/ChequeDeposit/manual-import`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Get import history API
  getImportHistory(pageNumber: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/ChequeDeposit/manual-import-history?pageNumber=${pageNumber}&pageSize=${pageSize}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Get import details API
  getImportDetails(id: number): Observable<ChequeDepositResponse> {
    return this.http.get<ChequeDepositResponse>(`${this.apiUrl}/ChequeDeposit/${id}/manual-details`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Retry import API
  retryImport(id: number): Observable<ChequeDepositResponse> {
    const retryData = {
      retriedBy: this.getCurrentUserName(),
      retriedOn: new Date().toISOString()
    };

    console.log('Retrying import with data:', {
      importId: id,
      retriedBy: this.getCurrentUserName(),
      retriedOn: new Date().toISOString()
    });

    return this.http.post<ChequeDepositResponse>(`${this.apiUrl}/ChequeDeposit/${id}/retry`, retryData, { 
      headers: this.getAuthHeaders() 
    });
  }
}
