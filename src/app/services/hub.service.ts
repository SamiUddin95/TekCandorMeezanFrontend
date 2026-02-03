import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface HubItem {
  id: number;
  isDeleted: boolean;
  code: string;
  name: string;
  createdBy: string;
  updatedBy: string;
  createdOn: string;
  updatedOn: string;
  crAccSameDay: string;
  crAccNormal: string;
  crAccIntercity: string;
  crAccDollar: string;
}

export interface HubResponse {
  status: string;
  data: {
    items: HubItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  } | HubItem | string;
  statusCode: number;
  errorMessage: string | null;
}

export interface HubListResponse {
  status: string;
  data: {
    items: HubItem[];
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
export class HubService {
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

  getHubs(pageNumber: number = 1, pageSize: number = 10): Observable<HubListResponse> {
    return this.http.get<HubListResponse>(`${this.apiUrl}/Hub?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers: this.getAuthHeaders() });
  }

  getHubById(id: number): Observable<HubResponse> {
    return this.http.get<HubResponse>(`${this.apiUrl}/Hub/${id}`, { headers: this.getAuthHeaders() });
  }

  createHub(hub: Partial<HubItem>): Observable<HubResponse> {
    const hubData = {
      ...hub,
      createdBy: this.getCurrentUserName()
    };
    return this.http.post<HubResponse>(`${this.apiUrl}/Hub`, hubData, { headers: this.getAuthHeaders() });
  }

  updateHub(id: number, hub: Partial<HubItem>): Observable<HubResponse> {
    const hubData = {
      ...hub,
      updatedBy: this.getCurrentUserName()
    };
    return this.http.put<HubResponse>(`${this.apiUrl}/Hub/${id}`, hubData, { headers: this.getAuthHeaders() });
  }

  deleteHub(id: number): Observable<HubResponse> {
    return this.http.delete<HubResponse>(`${this.apiUrl}/Hub/${id}`, { headers: this.getAuthHeaders() });
  }
}
