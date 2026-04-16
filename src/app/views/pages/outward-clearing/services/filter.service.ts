import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

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

@Injectable({
    providedIn: 'root'
})
export class FilterService {

    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getBranches(): Observable<BranchFilterResponse> {
        return this.http.get<BranchFilterResponse>(`${this.apiUrl}/Filter/branch`);
    }
}
