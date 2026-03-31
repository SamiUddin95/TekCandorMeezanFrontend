import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FinalReportItem {
  status: string;
  chequeNumber: string;
  amount: number;
}

export interface FinalReportListResponse {
  status: string;
  data: {
    items: FinalReportItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };
  statusCode: number;
  errorMessage: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class FinalReportService {
  private apiUrl = `${environment.apiUrl}/Reports`;

  constructor(private http: HttpClient) {}

  getFinalReport(
    pageNumber: number = 1, 
    pageSize: number = 10,
    fromDate?: string,
    toDate?: string,
    cycleCode?: number,
    branch?: string
  ): Observable<FinalReportListResponse> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }
    if (toDate) {
      params = params.set('toDate', toDate);
    }
    if (cycleCode) {
      params = params.set('cycleCode', cycleCode.toString());
    }
    if (branch) {
      params = params.set('branch', branch);
    }

    return this.http.get<FinalReportListResponse>(`${this.apiUrl}/FinalReport`, { params });
  }
}
