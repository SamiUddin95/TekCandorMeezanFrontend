import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SSRSReportRequest {
  reportPath: string;
  format: 'PDF' | 'EXCEL' | 'CSV';
  parameters: { [key: string]: any };
  fileName: string;
}

export interface SSRSReportResponse {
  status: string;
  data: {
    fileData: string; 
    fileName: string;
    contentType: string;
  };
  statusCode: number;
  errorMessage: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class SSRSReportService {
  private apiUrl = `${environment.apiUrl}/ReportFormat`;

  constructor(private http: HttpClient) {}

  private exportReport(request: SSRSReportRequest): Observable<any> {
    // Use the single endpoint for all reports
    return this.http.post(`${this.apiUrl}/BranchWise`, request, { 
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      // If blob fails, try as JSON
      catchError((error) => {
        console.log('Blob request failed, trying JSON:', error);
        return this.http.post(`${this.apiUrl}/BranchWise`, request, { 
          responseType: 'json',
          observe: 'response'
        });
      })
    );
  }

  exportBranchWiseReport(format: 'PDF' | 'EXCEL' | 'CSV', parameters: { [key: string]: any } = {}): Observable<any> {
    const request: SSRSReportRequest = {
      reportPath: '/SSRS_Reports/BranchWise',
      format: format,
      parameters: parameters,
      fileName: `BranchWiseReport_${new Date().toISOString().split('T')[0]}`
    };

    return this.exportReport(request);
  }

  exportFinalReport(format: 'PDF' | 'EXCEL' | 'CSV', parameters: { [key: string]: any } = {}): Observable<any> {
    const request: SSRSReportRequest = {
      reportPath: '/SSRS_Reports/FinalReport',
      format: format,
      parameters: parameters,
      fileName: `FinalReport_${new Date().toISOString().split('T')[0]}`
    };

    return this.exportReport(request);
  }

  exportCBCReport(format: 'PDF' | 'EXCEL' | 'CSV', parameters: { [key: string]: any } = {}): Observable<any> {
    const request: SSRSReportRequest = {
      reportPath: '/SSRS_Reports/CBCReport',
      format: format,
      parameters: parameters,
      fileName: `CBCReport_${new Date().toISOString().split('T')[0]}`
    };

    return this.exportReport(request);
  }

  exportReturnMemoReport(format: 'PDF' | 'EXCEL' | 'CSV', parameters: { [key: string]: any } = {}): Observable<any> {
    const request: SSRSReportRequest = {
      reportPath: '/SSRS_Reports/ReturnMemoReport',
      format: format,
      parameters: parameters,
      fileName: `ReturnMemoReport_${new Date().toISOString().split('T')[0]}`
    };

    return this.exportReport(request);
  }

  exportReturnRegisterReport(format: 'PDF' | 'EXCEL' | 'CSV', parameters: { [key: string]: any } = {}): Observable<any> {
    const request: SSRSReportRequest = {
      reportPath: '/SSRS_Reports/ReturnRegisterReport',
      format: format,
      parameters: parameters,
      fileName: `ReturnRegisterReport_${new Date().toISOString().split('T')[0]}`
    };

    return this.exportReport(request);
  }

  exportInwardClearingReport(format: 'PDF' | 'EXCEL' | 'CSV', parameters: { [key: string]: any } = {}): Observable<any> {
    const request: SSRSReportRequest = {
      reportPath: '/SSRS_Reports/InwardClearingReport',
      format: format,
      parameters: parameters,
      fileName: `InwardClearingReport_${new Date().toISOString().split('T')[0]}`
    };

    return this.exportReport(request);
  }

  exportClearingLogReport(format: 'PDF' | 'EXCEL' | 'CSV', parameters: { [key: string]: any } = {}): Observable<any> {
    const request: SSRSReportRequest = {
      reportPath: '/SSRS_Reports/ClearingLogReport',
      format: format,
      parameters: parameters,
      fileName: `ClearingLogReport_${new Date().toISOString().split('T')[0]}`
    };

    return this.exportReport(request);
  }

  // Utility method to download file from base64 data
  downloadFile(base64Data: string, fileName: string, contentType: string): void {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
