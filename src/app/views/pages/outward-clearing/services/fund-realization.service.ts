import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

    getFundRealizationList(
        pageNumber: number = 1,
        pageSize: number = 10,
        fromDate?: string,
        toDate?: string
    ): Observable<FundRealizationListResponse> {
        let params = new HttpParams()
            .set('pageNumber', pageNumber.toString())
            .set('pageSize', pageSize.toString());

        if (fromDate) {
            params = params.set('fromDate', fromDate);
        }
        if (toDate) {
            params = params.set('toDate', toDate);
        }

        return this.http.get<FundRealizationListResponse>(`${this.apiUrl}/outward/ChequeInfo/fund-realization-list`, { params });
    }
}
