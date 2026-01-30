import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface Industry {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  slug: string;
}

@Injectable({
  providedIn: 'root'
})
export class IndustriesService {
  private apiUrl = `${environment.apiUrl}admin/industries`; // Using API URL from environment

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Get all industries
  getIndustries(): Observable<Industry[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<Industry[]>(this.apiUrl, { headers });
  }

  // Get single industry by ID
  getIndustry(id: number): Observable<Industry> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<Industry>(`${this.apiUrl}/${id}`, { headers });
  }

  // Create new industry
  createIndustry(industry: { name: string }): Observable<Industry> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<Industry>(this.apiUrl, industry, { headers });
  }

  // Update industry
  updateIndustry(id: number, industry: { name: string; is_active?: boolean }): Observable<Industry> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<Industry>(`${this.apiUrl}/${id}`, industry, { headers });
  }

  // Delete industry (soft delete)
  deleteIndustry(id: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }
}
