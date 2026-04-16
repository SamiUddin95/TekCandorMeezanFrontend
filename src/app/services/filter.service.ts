import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';

export interface BranchItem {
    name: string;
    code: string;
}

export interface BranchFilterResponse {
    status: string;
    data: {
        branches: BranchItem[];
        filterType: string;
    };
    statusCode: number;
    errorMessage: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Get branches API
  getBranches(): Observable<BranchFilterResponse> {
    return this.http.get<BranchFilterResponse>(`${this.apiUrl}/Filter/branch`);
  }

  // Get hubs API
  getHubs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Filter/hub`);
  }

  // Get status options API
  getStatusOptions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Filter/status`);
  }

  // Get instrument options API
  getInstrumentOptions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Filter/instrument`);
  }

  // Get cycle options API
  getCycleOptions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Filter/cycle`);
  }

  // Get return reason options API
  getReturnReasonOptions(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Filter/returnreason`);
  }

  // Get posting restriction options API
  getPostingRestrictionOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/posting-restriction-options`);
  }

  // Get CBC status options API
  getCbcStatusOptions(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Filter/cbcStatus`);
  }

  // Get branch status options API
  getBranchStatusOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/branch-status-options`);
  }

  // Get res core options API
  getResCoreOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/res-core-options`);
  }
}
