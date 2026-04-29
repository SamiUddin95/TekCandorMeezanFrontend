import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface CreateBatchRequest {
    branch: string;
    maxInstruments: number;
}

export interface BatchDetails {
    id: number;
    batchId: string;
    branch: string;
    totalInstruments: number;
    totalAmount: number;
    status: string;
    maxInstruments: number;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
    submittedAt: string | null;
    submittedBy: string | null;
    authorizedAt: string | null;
    authorizedBy: string | null;
    rejectedAt: string | null;
    rejectedBy: string | null;
    rejectionReason: string | null;
}

export interface CreateBatchResponse {
    status: string;
    data: BatchDetails;
    statusCode: number;
    errorMessage: string | null;
}

export interface BatchDateRangeResponse {
    status: string;
    data: BatchDetails[];
    statusCode: number;
    errorMessage: string | null;
}

export interface BatchStatistics {
    totalBatchesToday: number;
    pendingAuthorization: number;
    authorizedValue: number;
    processingExceptions: number;
    draftBatches: number;
    authorizedBatches: number;
    rejectedBatches: number;
}

export interface BatchStatisticsResponse {
    status: string;
    data: BatchStatistics;
    statusCode: number;
    errorMessage: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class BatchManagementService {

    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    createBatch(request: CreateBatchRequest): Observable<CreateBatchResponse> {
        return this.http.post<CreateBatchResponse>(`${this.apiUrl}/outward/Batch`, request);
    }

    getBatchesByDateRange(fromDate: string, toDate: string): Observable<BatchDateRangeResponse> {
        return this.http.get<BatchDateRangeResponse>(`${this.apiUrl}/outward/Batch/date-range?fromDate=${fromDate}&toDate=${toDate}`);
    }

    getBatchStatistics(): Observable<BatchStatisticsResponse> {
        return this.http.get<BatchStatisticsResponse>(`${this.apiUrl}/outward/Batch/statistics`);
    }

    submitBatch(batchId: string): Observable<CreateBatchResponse> {
        return this.http.post<CreateBatchResponse>(`${this.apiUrl}/outward/Batch/submit/${batchId}`, {});
    }

    authorizeBatch(batchId: string): Observable<CreateBatchResponse> {
        return this.http.post<CreateBatchResponse>(`${this.apiUrl}/outward/Batch/authorize/${batchId}`, {});
    }
}
