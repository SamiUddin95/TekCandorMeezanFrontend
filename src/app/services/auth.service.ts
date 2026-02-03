import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
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

  constructor(private http: HttpClient) {
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
    this.currentUserSubject.next(response.data);
    this.isLoggedInSubject.next(true);
  }

  private checkAuthStatus() {
    const token = sessionStorage.getItem('access_token');
    const userStr = sessionStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
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
    this.http.post(`${this.apiUrl}logout`, {}, { headers }).subscribe({
      next: (response) => {
        this.clearSessionAndRedirect();
      },
      error: (error) => {
        this.clearSessionAndRedirect();
      }
    });
  }

  private clearSessionAndRedirect() {
    sessionStorage.clear();
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
