import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { JwtDecoderService } from './jwt-decoder.service';

export interface User {
branchOrHub: any;
email: any;
phone: any;
active: any;
branchId: any;
hubId: any;
  userid: number;
  name: string;
  loginName: string;
  token: string;
  expiresUtc: string;
  expiresLocal: string;
}

export interface LoginResponse {
  status: string;
  data: User;
  statusCode: number;
  errorMessage: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl; // Using API URL from environment

  constructor(private http: HttpClient, private jwtDecoder: JwtDecoderService) {
    this.checkAuthStatus();
  }

  // Login method
  login(credentials: { loginName: string; password: string }): Observable<LoginResponse> {
    return new Observable(observer => {
      this.http.post<LoginResponse>(`${environment.apiUrl}/Auth/login`, credentials).subscribe({
        next: (response) => {
          this.handleLoginSuccess(response);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  private handleLoginSuccess(response: LoginResponse) {
    sessionStorage.setItem('access_token', response.data.token);
    sessionStorage.setItem('token_type', 'Bearer');
    sessionStorage.setItem('user', JSON.stringify(response.data));
    
    // Decode JWT token and extract permissions
    const tokenClaims = this.jwtDecoder.getTokenClaims(response.data.token);
    const userPermissions = tokenClaims.permissions || [];
    
    // Store permissions in local storage
    localStorage.setItem('user_permissions', JSON.stringify(userPermissions));
    
    // Store token claims for easy access
    localStorage.setItem('token_claims', JSON.stringify(tokenClaims));
    
    console.log('JWT Token Claims:', tokenClaims);
    console.log('User Permissions:', userPermissions);
    
    this.currentUserSubject.next(response.data);
    this.isLoggedInSubject.next(true);
  }

  private checkAuthStatus() {
    const token = sessionStorage.getItem('access_token');
    const userStr = sessionStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        
        // Check if token is expired
        if (this.jwtDecoder.isTokenExpired(token)) {
          this.clearSessionAndRedirect();
          return;
        }
        
        // Load permissions from local storage or decode token if not available
        let permissions = [];
        const permissionsStr = localStorage.getItem('user_permissions');
        
        if (permissionsStr) {
          permissions = JSON.parse(permissionsStr);
        } else {
          // Decode token and store permissions if not in local storage
          const tokenClaims = this.jwtDecoder.getTokenClaims(token);
          permissions = tokenClaims.permissions || [];
          localStorage.setItem('user_permissions', JSON.stringify(permissions));
        }
        
        console.log('Loaded user permissions:', permissions);
        
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
      } catch (error) {
        console.error('Error parsing user from session storage:', error);
        this.logout();
      }
    } else {
      this.currentUserSubject.next(null);
      this.isLoggedInSubject.next(false);
    }
  }

  getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('access_token');
    const tokenType = sessionStorage.getItem('token_type') || 'Bearer';
    
    return new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `${tokenType} ${token}`
    });
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return sessionStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }

  logout() {
    const headers = this.getAuthHeaders();
    this.http.post(`${this.apiUrl}/Auth/logout`, {}, { headers }).subscribe({
      next: (response) => {
        console.log('Logout successful:', response);
        this.clearSessionAndRedirect();
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.clearSessionAndRedirect();
      }
    });
  }

  // Permission Management Methods

  // Get user permissions from local storage
  getUserPermissions(): string[] {
    const permissionsStr = localStorage.getItem('user_permissions');
    if (permissionsStr) {
      try {
        return JSON.parse(permissionsStr);
      } catch (error) {
        console.error('Error parsing permissions from local storage:', error);
        return [];
      }
    }
    return [];
  }

  // Get token claims from local storage
  getTokenClaims(): any {
    const claimsStr = localStorage.getItem('token_claims');
    if (claimsStr) {
      try {
        return JSON.parse(claimsStr);
      } catch (error) {
        console.error('Error parsing token claims from local storage:', error);
        return {};
      }
    }
    return {};
  }

  // Check if user has specific permission
  hasPermission(permission: string): boolean {
    const permissions = this.getUserPermissions();
    return permissions.includes(permission);
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = this.getUserPermissions();
    return permissions.some(permission => userPermissions.includes(permission));
  }

  // Check if user has all specified permissions
  hasAllPermissions(permissions: string[]): boolean {
    const userPermissions = this.getUserPermissions();
    return permissions.every(permission => userPermissions.includes(permission));
  }

  // Refresh permissions from token
  refreshPermissions(): void {
    const token = sessionStorage.getItem('access_token');
    if (token) {
      const tokenClaims = this.jwtDecoder.getTokenClaims(token);
      const permissions = tokenClaims.permissions || [];
      localStorage.setItem('user_permissions', JSON.stringify(permissions));
      localStorage.setItem('token_claims', JSON.stringify(tokenClaims));
      console.log('Refreshed user permissions:', permissions);
    }
  }

  // Clear permissions on logout
  clearPermissions(): void {
    localStorage.removeItem('user_permissions');
    localStorage.removeItem('token_claims');
  }

  private clearSessionAndRedirect() {
    sessionStorage.clear();
    this.clearPermissions(); // Clear permissions from local storage
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    window.location.href = '/sign-in';
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? 'user' : null; // Default role since API doesn't specify roles
  }

  // Check if user is admin
  isAdmin(): boolean {
    return false; // Default to false since API doesn't specify roles
  }

  // Get user ID
  getUserId(): number | null {
    const user = this.getCurrentUser();
    return user ? user.userid : null;
  }

  // Update user info in session storage
  updateUser(user: User) {
    sessionStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // BehaviorSubjects for reactive state management
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);

  currentUser$ = this.currentUserSubject.asObservable();
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
}
