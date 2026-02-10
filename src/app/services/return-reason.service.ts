import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ReturnReasonItem {
  id: number;
  code: string;
  alphaReturnCodes: string;
  numericReturnCodes: string;
  descriptionWithReturnCodes: string;
  defaultCallBack: boolean;
  name: string;
  isDeleted: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  createdOn: string | null;
  updatedOn: string | null;
}

export interface ReturnReasonResponse {
  status: string;
  data: {
    items: ReturnReasonItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  } | ReturnReasonItem | boolean;
  statusCode: number;
  errorMessage: string | null;
}

export interface ReturnReasonListResponse {
  status: string;
  data: {
    items: ReturnReasonItem[];
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
export class ReturnReasonService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get all return reasons with pagination
  getReturnReasons(pageNumber: number = 1, pageSize: number = 10): Observable<ReturnReasonListResponse> {
    return this.http.get<ReturnReasonListResponse>(`${this.apiUrl}/ReturnReason?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers: this.getAuthHeaders() });
  }

  // Get return reason by ID
  getReturnReasonById(id: number): Observable<ReturnReasonResponse> {
    return this.http.get<ReturnReasonResponse>(`${this.apiUrl}/ReturnReason/${id}`, { headers: this.getAuthHeaders() });
  }

  // Create new return reason
  createReturnReason(returnReason: Partial<ReturnReasonItem>): Observable<ReturnReasonResponse> {
    const returnReasonData = {
      ...returnReason,
      createdBy: this.getCurrentUserName()
      // Note: updatedBy is not included for create operations
    };
    console.log('Creating return reason with data:', returnReasonData);
    return this.http.post<ReturnReasonResponse>(`${this.apiUrl}/ReturnReason`, returnReasonData, { headers: this.getAuthHeaders() });
  }

  // Update return reason
  updateReturnReason(id: number, returnReason: Partial<ReturnReasonItem>): Observable<ReturnReasonResponse> {
    const returnReasonData = {
      ...returnReason,
      updatedBy: this.getCurrentUserName()
      // Note: updatedBy is only included for update operations
    };
    console.log('Updating return reason with data:', returnReasonData);
    return this.http.put<ReturnReasonResponse>(`${this.apiUrl}/ReturnReason/${id}`, returnReasonData, { headers: this.getAuthHeaders() });
  }

  // Delete return reason
  deleteReturnReason(id: number): Observable<ReturnReasonResponse> {
    return this.http.delete<ReturnReasonResponse>(`${this.apiUrl}/ReturnReason/${id}`, { headers: this.getAuthHeaders() });
  }

  // Get auth headers
  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('access_token');
    return new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Get current user name from session storage
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
}
