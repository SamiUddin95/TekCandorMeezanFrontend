import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Group interfaces based on API response
export interface GroupItem {
  id: number;
  name: string | null;
  description: string | null;
  version: number;
  isNew: boolean;
  isDeleted: boolean;
  createdBy: string;
  updatedBy: string;
  createdOn: string;
  updatedOn: string;
}

export interface GroupCreateRequest {
  name: string;
  description: string;
}

export interface GroupUpdateRequest {
  id: number;
  name: string;
  description: string;
}

export interface GroupResponse {
  status: string;
  data: GroupItem;
  statusCode: number;
  errorMessage: string | null;
}

export interface GroupListResponse {
  status: string;
  data: {
    items: GroupItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };
  statusCode: number;
  errorMessage: string | null;
}

// Permission interfaces based on API response
export interface PermissionItem {
  id: number;
  groupId: number;
  groupName: string | null;
  name: string;
  description: string;
  isDeleted: boolean;
  createdOn: string;
  updatedOn: string | null;
}

export interface PermissionListResponse {
  status: string;
  data: {
    items: PermissionItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };
  statusCode: number;
  errorMessage: string | null;
}

export interface AssignPermissionsRequest {
  groupId: number;
  permissionIds: number[];
}

export interface AssignPermissionsResponse {
  status: string;
  data: any;
  statusCode: number;
  errorMessage: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get current user name for createdBy/updatedBy
  private getCurrentUserName(): string {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.name || user.loginName || 'System';
      } catch (error) {
        console.error('Error parsing user from session storage:', error);
      }
    }
    return 'System';
  }

  // Get authentication headers
  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('access_token');
    const tokenType = sessionStorage.getItem('token_type') || 'Bearer';
    
    return new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `${tokenType} ${token}`
    });
  }

  // Group API Methods

  // Get all groups with pagination
  getGroups(pageNumber: number = 1, pageSize: number = 10): Observable<GroupListResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<GroupListResponse>(
      `${this.apiUrl}/Group?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      { headers }
    );
  }

  // Get group by ID
  getGroupById(id: number): Observable<GroupResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<GroupResponse>(`${this.apiUrl}/Group/${id}`, { headers });
  }

  // Create new group
  createGroup(group: GroupCreateRequest): Observable<GroupResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<GroupResponse>(`${this.apiUrl}/Group`, group, { headers });
  }

  // Update group
  updateGroup(group: GroupUpdateRequest): Observable<GroupResponse> {
    const headers = this.getAuthHeaders();
    return this.http.put<GroupResponse>(`${this.apiUrl}/Group/${group.id}`, group, { headers });
  }

  // Delete group
  deleteGroup(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/Group/${id}`, { headers });
  }

  // Permission API Methods

  // Get all permissions with pagination
  getPermissions(pageNumber: number = 1, pageSize: number = 50): Observable<PermissionListResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<PermissionListResponse>(
      `${this.apiUrl}/Permission?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      { headers }
    );
  }

  // Assign permissions to group
  assignPermissions(request: AssignPermissionsRequest): Observable<AssignPermissionsResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<AssignPermissionsResponse>(
      `${this.apiUrl}/Group/assign-permissions`,
      request,
      { headers }
    );
  }
}
