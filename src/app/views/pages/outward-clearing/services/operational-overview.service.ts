import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface SupervisorListItem {
    id: number;
    date: string;
    depositorTitle: string;
    beneficiaryTitle: string;
    receiverBranchCode: string;
    branchName: string | null;
    chequeNo: string;
    amount: number;
    referenceNo: string;
    status: string;
    createdOn: string;
}

export interface SupervisorListResponse {
    status: string;
    data: {
        items: SupervisorListItem[];
        totalCount: number;
    };
    statusCode: number;
    errorMessage: string | null;
}

export interface ChequeDetailItem {
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

export interface ChequeDetailResponse {
    status: string;
    data: ChequeDetailItem;
    statusCode: number;
    errorMessage: string | null;
}

export interface ChequeActionResponse {
    status: string;
    data: string;
    statusCode: number;
    errorMessage: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class OperationalOverviewService {

    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getSupervisorList(): Observable<SupervisorListResponse> {
        return this.http.get<SupervisorListResponse>(`${this.apiUrl}/outward/ChequeInfo/supervisorList`);
    }

    getById(id: number): Observable<ChequeDetailResponse> {
        return this.http.get<ChequeDetailResponse>(`${this.apiUrl}/outward/ChequeInfo/${id}`);
    }

    approveCheque(id: number): Observable<ChequeActionResponse> {
        return this.http.put<ChequeActionResponse>(`${this.apiUrl}/outward/ChequeInfo/approve/${id}`, {});
    }

    rejectCheque(id: number, remarks?: string): Observable<ChequeActionResponse> {
        const cleanedRemarks = (remarks ?? '').trim();
        const params = cleanedRemarks
            ? new HttpParams().set('remarks', cleanedRemarks)
            : undefined;

        return this.http.put<ChequeActionResponse>(`${this.apiUrl}/outward/ChequeInfo/reject/${id}`, {}, { params });
    }
}
