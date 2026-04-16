import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface NiftApiRecord {
    chequeNo: string;
    branchName: string;
    amount: number;
    date: string;
    discrepancy: string;
}

export interface NiftUploadSummary {
    totalLodgement: number;
    matched: number;
    unmatched: number;
    totalAmount: number;
}

export interface NiftUploadData {
    matchedRecords: NiftApiRecord[];
    unmatchedRecords: NiftApiRecord[];
    summary: NiftUploadSummary;
}

export interface NiftUploadResponse {
    status: string;
    data: NiftUploadData | null;
    statusCode: number;
    errorMessage: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class NiftReconciliationService {

    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getReconcileList(): Observable<NiftUploadResponse> {
        return this.http.get<NiftUploadResponse>(`${this.apiUrl}/outward/ChequeInfo/reconcile-list`);
    }

    uploadNiftFile(file: File): Observable<NiftUploadResponse> {
        const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
        const fileType = ext === 'txt' ? 'txt' : ext === 'xls' ? 'xls' : 'xlsx';

        const formData = new FormData();
        formData.append('file', file, file.name);
        formData.append('fileType', fileType);

        return this.http.post<NiftUploadResponse>(
            `${this.apiUrl}/outward/ChequeInfo/upload-nift`,
            formData
        );
    }
}
