import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface ChequeInfoRequest {
    id: number;
    date: string;
    depositorType: string;
    accountNo: string;
    cnic: string;
    depositorTitle: string;
    beneficiaryAccountNumber: string;
    beneficiaryTitle: string;
    accountStatus: string;
    beneficiaryBranchCode: string;
    chequeNo: string;
    payingBankCode: string;
    payingBranchCode: string;
    amount: number;
    chequeDate: string;
    instrumentType: string;
    micr: string;
    ocrEngine: string;
    processingTime: string;
    accuracy: string;
    imageF: string;
    imageB: string;
    imageU: string;
    currency: string;
    remarks: string;
    receiverBranchCode: string;
    branchName: string;
    drawerBank: string;
    amountInWords: string;
    referenceNo: string;
    depositSlipId: number;
    status: string;
    isReconciled: boolean;
    isReturned: boolean;
    isRealized: boolean;
    createdOn: string;
    createdBy: string;
    updatedOn: string;
    updatedBy: string;
}

export interface ChequeInfoItem {
    id: number;
    date: string;
    depositorType: string;
    accountNo: string;
    cnic: string;
    depositorTitle: string;
    beneficiaryAccountNumber: string;
    beneficiaryTitle: string;
    accountStatus: string;
    beneficiaryBranchCode: string;
    chequeNo: string;
    payingBankCode: string;
    payingBranchCode: string;
    amount: number;
    chequeDate: string;
    instrumentType: string;
    micr: string;
    ocrEngine: string;
    processingTime: string;
    accuracy: string;
    imageF: string;
    imageB: string;
    imageU: string;
    currency: string;
    remarks: string;
    receiverBranchCode: string;
    branchName: string | null;
    drawerBank: string;
    amountInWords: string;
    referenceNo: string;
    depositSlipId: number;
    status: string;
    isReconciled: boolean;
    isReturned: boolean;
    isRealized: boolean;
    createdOn: string;
    createdBy: string;
    updatedOn: string | null;
    updatedBy: string | null;
}

export interface ChequeInfoListResponse {
    status: string;
    data: {
        items: ChequeInfoItem[];
        totalCount: number;
    };
    statusCode: number;
    errorMessage: string | null;
}

export interface ChequeInfoByIdResponse {
    status: string;
    data: ChequeInfoItem;
    statusCode: number;
    errorMessage: string | null;
}

export interface ChequeInfoResponse {
    status: string;
    data: unknown;
    statusCode: number;
    errorMessage: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class ChequeInfoService {

    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getChequeInfos(): Observable<ChequeInfoListResponse> {
        return this.http.get<ChequeInfoListResponse>(`${this.apiUrl}/outward/ChequeInfo`);
    }

    getChequeInfoById(id: number): Observable<ChequeInfoByIdResponse> {
        return this.http.get<ChequeInfoByIdResponse>(`${this.apiUrl}/outward/ChequeInfo/${id}`);
    }

    createChequeInfo(payload: ChequeInfoRequest): Observable<ChequeInfoResponse> {
        return this.http.post<ChequeInfoResponse>(`${this.apiUrl}/outward/ChequeInfo`, payload);
    }

    updateChequeInfo(id: number, payload: ChequeInfoRequest): Observable<ChequeInfoResponse> {
        return this.http.put<ChequeInfoResponse>(`${this.apiUrl}/outward/ChequeInfo/${id}`, payload);
    }
}
