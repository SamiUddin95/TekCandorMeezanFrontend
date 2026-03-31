import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BranchItem {
  id: number;
  code: string;
  niftBranchCode: string;
  name: string;
  hubId: number;
  isDeleted: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  createdOn: string | null;
  updatedOn: string | null;
  email1: string;
  email2: string;
  email3: string;
}

export interface FilterBranchItem {
  name: string;
  code: string;
}

export interface FilterStatusItem {
  text: string;
  value: string;
}

export interface FilterHubItem {
  name: string;
  code: string;
}

export interface BranchResponse {
  status: string;
  data: {
    items: BranchItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  } | BranchItem | string;
  statusCode: number;
  errorMessage: string | null;
}

export interface BranchListResponse {
  status: string;
  data: {
    items: BranchItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };
  statusCode: number;
  errorMessage: string | null;
}

export interface FilterBranchResponse {
  status: string;
  data: {
    branches: FilterBranchItem[];
    filterType: string;
  };
  statusCode: number;
  errorMessage: string | null;
}

export interface FilterStatusResponse {
  status: string;
  data: {
    statuses: FilterStatusItem[];
  };
  statusCode: number;
  errorMessage: string | null;
}

export interface FilterHubResponse {
  status: string;
  data: {
    hubs: FilterHubItem[];
    filterType: string;
  };
  statusCode: number;
  errorMessage: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class BranchService {
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
  
  getBranches(pageNumber: number = 1, pageSize: number = 10): Observable<BranchListResponse> {
    return this.http.get<BranchListResponse>(`${this.apiUrl}/Branch?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers: this.getAuthHeaders() });
  }

  getFilterBranches(): Observable<FilterBranchResponse> {
    return this.http.get<FilterBranchResponse>(`${this.apiUrl}/Filter/branch`, { headers: this.getAuthHeaders() });
  }

  getFilterStatuses(): Observable<FilterStatusResponse> {
    return this.http.get<FilterStatusResponse>(`${this.apiUrl}/Filter/status`, { headers: this.getAuthHeaders() });
  }

  getFilterHubs(): Observable<FilterHubResponse> {
    return this.http.get<FilterHubResponse>(`${this.apiUrl}/Filter/hub`, { headers: this.getAuthHeaders() });
  }
 
  getBranchById(id: number): Observable<BranchResponse> {
    return this.http.get<BranchResponse>(`${this.apiUrl}/Branch/${id}`, { headers: this.getAuthHeaders() });
  }
 
  createBranch(branch: Partial<BranchItem>): Observable<BranchResponse> {
    const branchData = {
      ...branch,
      createdBy: this.getCurrentUserName()
    };
    console.log('Creating branch with data:', branchData);
    return this.http.post<BranchResponse>(`${this.apiUrl}/Branch`, branchData, { headers: this.getAuthHeaders() });
  }
 
  updateBranch(id: number, branch: Partial<BranchItem>): Observable<BranchResponse> {
    const branchData = {
      ...branch,
      updatedBy: this.getCurrentUserName()
    };
    console.log('Updating branch with data:', branchData);
    return this.http.put<BranchResponse>(`${this.apiUrl}/Branch/${id}`, branchData, { headers: this.getAuthHeaders() });
  }
 
  deleteBranch(id: number): Observable<BranchResponse> {
    return this.http.delete<BranchResponse>(`${this.apiUrl}/Branch/${id}`, { headers: this.getAuthHeaders() });
  }

}
