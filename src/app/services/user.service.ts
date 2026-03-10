import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { UserItem } from '../views/pages/user-management/user-management';
import { HubListResponse } from './hub.service';
import { BranchListResponse } from './branch.service';

@Injectable({
  providedIn: 'root'
})
export class Userservice {
    private apiUrl = environment.apiUrl;
  
    constructor(private http: HttpClient) {}

getAllUsers(pageNumber: number = 1, pageSize: number = 10): Observable<any> {
  return this.http.get<any>(
    `${this.apiUrl}/User?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    { headers: this.getAuthHeaders() }
  );
}

addUser(user: Partial<UserItem>): Observable<any> {
    const userData = {
      ...user,
      createdBy: this.getCurrentUserName()
      // updatedBy not needed for creation
    };
    console.log('Adding user with data:', userData);
    return this.http.post<any>(`${this.apiUrl}/User`, userData, { headers: this.getAuthHeaders() });
  }
  updateUser(userId: number, user: Partial<UserItem>): Observable<any> {
    const userData = {
      ...user,
      updatedBy: this.getCurrentUserName()
    };
    console.log('Updating user with data:', userData);
    return this.http.put<any>(`${this.apiUrl}/User/${userId}`, userData, { headers: this.getAuthHeaders() });
  }


  deleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/User/${userId}`, { headers: this.getAuthHeaders() });
  }
  getHubs(pageNumber: number = 1, pageSize: number = 10): Observable<HubListResponse> {
     return this.http.get<HubListResponse>(`${this.apiUrl}/Hub?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers: this.getAuthHeaders() });
   }
   getBranches(pageNumber: number = 1, pageSize: number = 10): Observable<BranchListResponse> {
    return this.http.get<BranchListResponse>(`${this.apiUrl}/Branch?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers: this.getAuthHeaders() });
  }
  getAllGroups(pageNumber: number = 1, pageSize: number = 10): Observable<any> {
  return this.http.get<any>(
    `${this.apiUrl}/Group?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    { headers: this.getAuthHeaders() }
  );
}



 private getCurrentUserName(): string {
  try {
    const userStr = sessionStorage.getItem('user'); 
    if (!userStr) return 'Unknown';                  

    const user = JSON.parse(userStr);               
    console.log('User object from session storage:', user);

  
    const userName = user.name?.trim() || user.loginName?.trim() || 'Unknown';
    console.log('Extracted user name:', userName);

    return userName;
  } catch (error) {
    console.error('Error parsing user from session storage:', error);
    return 'Unknown';
  }
}

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('access_token');
    return new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}
