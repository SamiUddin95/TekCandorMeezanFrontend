import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface ReturnListItem {
    chequeInfoId: number;
    date: string;
    depositorType: string;
    accountNo: string;
    cnic: string;
    depositorTitle: string;
    branchName: string;
    chequeNo: string;
    amount: number;
    micr: string;
    status: string;
    matchStatus: string;
    niftStagingId: number;
    fileName: string;
    uploadDate: string;
    returnCode: string;
    returnReason: string;
    isProcessed: boolean;
}

export interface ReturnListResponse {
    status: string;
    data: {
        items: ReturnListItem[];
        totalCount: number;
    };
    statusCode: number;
    errorMessage: string | null;
}

export interface ReturnDetailData {
    beneficiaryTitle: string;
    accountNo: string;
    chequeDate: string;
    branchName: string;
    returnReason: string;
    chequeNo: string;
    amount: number;
    imageF: string;
    imageB: string;
    imageU: string;
}

export interface ReturnDetailResponse {
    status: string;
    data: ReturnDetailData;
    statusCode: number;
    errorMessage: string | null;
}

export interface MarkReturnResponse {
    status: string;
    data: string;
    statusCode: number;
    errorMessage: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class ReturnMarkingUtilityService {

    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getReturnList(): Observable<ReturnListResponse> {
        return this.http.get<ReturnListResponse>(`${this.apiUrl}/outward/ChequeInfo/return-list`);
    }

    getReturnDetail(id: number): Observable<ReturnDetailResponse> {
        return this.http.get<ReturnDetailResponse>(`${this.apiUrl}/outward/ChequeInfo/return-detail/${id}`);
    }

    markReturn(id: number): Observable<MarkReturnResponse> {
        return this.http.put<MarkReturnResponse>(`${this.apiUrl}/outward/ChequeInfo/mark-return/${id}`, {});
    }
}
