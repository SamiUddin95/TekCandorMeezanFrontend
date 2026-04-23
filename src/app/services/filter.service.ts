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

export interface HubItem {
    name: string;
    code: string;
}

export interface HubFilterResponse {
    status: string;
    data: {
        hubs: HubItem[];
        filterType: string;
    };
    statusCode: number;
    errorMessage: string | null;
}

export interface BranchInstrumentAmountResponse {
    status: string;
    data: {
        branchCode: string;
        branchName: string;
        totalInstrumentCount: number;
        totalAmount: number;
    };
    statusCode: number;
    errorMessage: string | null;
}

export interface HubInstrumentAmountResponse {
    status: string;
    data: {
        hubCode: string;
        hubName: string;
        totalInstrumentCount: number;
        totalAmount: number;
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
  getHubs(): Observable<HubFilterResponse> {
    return this.http.get<HubFilterResponse>(`${this.apiUrl}/Filter/hub`);
  }

  // Get instrument count/amount for a branch
  getBranchInstrumentAmount(branchCode: string, date?: string): Observable<BranchInstrumentAmountResponse> {
    const params: any = { branchCode };
    if (date) params.date = date;
    return this.http.get<BranchInstrumentAmountResponse>(
      `${this.apiUrl}/Filter/branch-Instrument-Amount`,
      { params }
    );
  }

  // Get instrument count/amount for a hub
  getHubInstrumentAmount(hubCode: string, date?: string): Observable<HubInstrumentAmountResponse> {
    const params: any = { hubCode };
    if (date) params.date = date;
    return this.http.get<HubInstrumentAmountResponse>(
      `${this.apiUrl}/Filter/hub-Instrument-Amount`,
      { params }
    );
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
