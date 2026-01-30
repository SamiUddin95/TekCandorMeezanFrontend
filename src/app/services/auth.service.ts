import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  google_id: string | null;
  facebook_id: string | null;
  avatar: string | null;
  role: string;
  status: string;
  is_premium: boolean;
  premium_expires_at: string | null;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: User;
  next_step: string;
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
  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return new Observable(observer => {
      this.http.post<LoginResponse>(`${this.apiUrl}login`, credentials).subscribe({
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

  // Handle successful login
  private handleLoginSuccess(response: LoginResponse) {
    // Store token in session storage
    sessionStorage.setItem('access_token', response.access_token);
    sessionStorage.setItem('token_type', response.token_type);
    
    // Store user info in session storage
    sessionStorage.setItem('user', JSON.stringify(response.user));
    
    // Update BehaviorSubjects
    this.currentUserSubject.next(response.user);
    this.isLoggedInSubject.next(true);
    
  }

  // Check authentication status on app load
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

  // Get authentication headers
  getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('access_token');
    const tokenType = sessionStorage.getItem('token_type') || 'Bearer';
    
    return new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `${tokenType} ${token}`
    });
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Get token
  getToken(): string | null {
    return sessionStorage.getItem('access_token');
  }

  // Check if user is logged in
  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }

  // Logout
  logout() {
    // Call logout API first
    const headers = this.getAuthHeaders();
    
    this.http.post(`${this.apiUrl}logout`, {}, { headers }).subscribe({
      next: (response) => {
        this.clearSessionAndRedirect();
      },
      error: (error) => {
        // Even if API fails, clear session and redirect
        this.clearSessionAndRedirect();
      }
    });
  }

  // Clear session storage and redirect
  private clearSessionAndRedirect() {
    // Clear all session storage
    sessionStorage.clear();
    
    // Update BehaviorSubjects
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    
    
    // Redirect to login page
    window.location.href = '/sign-in';
  }

  // Get user role
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  // Get user ID
  getUserId(): number | null {
    const user = this.getCurrentUser();
    return user ? user.id : null;
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
