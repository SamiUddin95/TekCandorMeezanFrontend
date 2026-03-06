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
  date: string;  
  totalRecords: number;
  successfullRecords: number; 
  failureRecords: number;
  status: string;
  details?: ImportDetail[]; 
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

  importFile(services?: { import?: boolean; startService?: boolean; ssCardService?: boolean; sftpImageUpload?: boolean }): Observable<any> {
    const payload = {
      import: services?.import || false,
      startService: services?.startService || false,
      ssCardService: services?.ssCardService || false,
      sftpImageUpload: services?.sftpImageUpload || false,
      importedBy: this.getCurrentUserName()
    };
    return this.http.post(`${this.apiUrl}/ChequeDeposit/manual-import`, payload, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Import data API
  importData(): Observable<any> {
    return this.http.post(`${this.apiUrl}/ChequeDeposit/import`, {}, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Get import history API (for upload-file component)
  getImportHistory(pageNumber: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/ChequeDeposit/import-history?pageNumber=${pageNumber}&pageSize=${pageSize}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Get manual import history API (for manual-import component)
  getManualImportHistory(pageNumber: number = 1, pageSize: number = 10): Observable<any> {
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

  // Get cheque details API
  getChequeDetails(id: number): Observable<any> {
    console.log('Fetching cheque details:', {
      chequeId: id,
      url: `${this.apiUrl}/ChequeDeposit/${id}`,
      token: sessionStorage.getItem('access_token') ? 'Token exists' : 'No token'
    });

    return this.http.get(`${this.apiUrl}/ChequeDeposit/${id}`, { 
      headers: this.getAuthHeaders() 
    });
  }
}
