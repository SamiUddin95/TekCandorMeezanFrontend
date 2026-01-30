import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface Interest {
  id?: number;
  name: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InterestsService {
  private apiUrl = `${environment.apiUrl}admin/interests`; // Using API URL from environment

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Get all interests
  getInterests(): Observable<Interest[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<Interest[]>(this.apiUrl, { headers });
  }

  // Get single interest by ID
  getInterest(id: number): Observable<Interest> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<Interest>(`${this.apiUrl}/${id}`, { headers });
  }

  // Create new interest
  createInterest(interest: { name: string }): Observable<Interest> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<Interest>(this.apiUrl, interest, { headers });
  }

  // Update interest
  updateInterest(id: number, interest: { name: string; is_active?: boolean }): Observable<Interest> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<Interest>(`${this.apiUrl}/${id}`, interest, { headers });
  }

  // Delete interest (soft delete)
  deleteInterest(id: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }
}
