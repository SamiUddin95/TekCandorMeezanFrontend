import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CycleItem {
  id: number;
  code: string;
  name: string;
  isDeleted: boolean;
  createdBy: string;
  updatedBy: string;
  createdOn: string;
  updatedOn: string | null;
}

export interface CycleResponse {
  status: string;
  data: {
    items: CycleItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  } | CycleItem | string;
  statusCode: number;
  errorMessage: string | null;
}

export interface CycleListResponse {
  status: string;
  data: {
    items: CycleItem[];
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
export class CycleService {
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
        return user.name || user.loginName || 'Unknown';
      }
    } catch (error) {
      console.error('Error getting user from session storage:', error);
    }
    return 'Unknown';
  }
 
  getCycles(pageNumber: number = 1, pageSize: number = 10): Observable<CycleListResponse> {
    return this.http.get<CycleListResponse>(`${this.apiUrl}/Cycle?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers: this.getAuthHeaders() });
  }
 
  getCycleById(id: number): Observable<CycleResponse> {
    return this.http.get<CycleResponse>(`${this.apiUrl}/Cycle/${id}`, { headers: this.getAuthHeaders() });
  }

  createCycle(cycle: Partial<CycleItem>): Observable<CycleResponse> {
    const cycleData = {
      ...cycle,
      createdBy: this.getCurrentUserName()
    };
    return this.http.post<CycleResponse>(`${this.apiUrl}/Cycle`, cycleData, { headers: this.getAuthHeaders() });
  }

  updateCycle(id: number, cycle: Partial<CycleItem>): Observable<CycleResponse> {
    const cycleData = {
      ...cycle,
      updatedBy: this.getCurrentUserName()
    };
    return this.http.put<CycleResponse>(`${this.apiUrl}/Cycle/${id}`, cycleData, { headers: this.getAuthHeaders() });
  }

  deleteCycle(id: number): Observable<CycleResponse> {
    return this.http.delete<CycleResponse>(`${this.apiUrl}/Cycle/${id}`, { headers: this.getAuthHeaders() });
  }
}
