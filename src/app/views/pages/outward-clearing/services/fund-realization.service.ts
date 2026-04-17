import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface FundRealizationItem {
    receiverBranchCode: string;
    branchName: string;
    totalAmount: number;
    chequeCount: number;
}

export interface FundRealizationListResponse {
    status: string;
    data: {
        items: FundRealizationItem[];
        totalCount: number;
    };
    statusCode: number;
    errorMessage: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class FundRealizationService {

    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getFundRealizationList(): Observable<FundRealizationListResponse> {
        return this.http.get<FundRealizationListResponse>(`${this.apiUrl}/outward/ChequeInfo/fund-realization-list`);
    }
}
