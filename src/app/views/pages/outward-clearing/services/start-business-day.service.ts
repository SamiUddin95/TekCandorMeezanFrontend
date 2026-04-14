import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface BusinessDayResponse {
    status: string;
    data: {
        businessDate: string;
        isDayStarted: boolean;
    };
    statusCode: number;
    errorMessage: string | null;
}

export interface StartDayResponse {
    status: string;
    data: string;
    statusCode: number;
    errorMessage: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class StartBusinessDayService {

    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    getBusinessDay(): Observable<BusinessDayResponse> {
        return this.http.get<BusinessDayResponse>(
            `${this.apiUrl}/api/OutwardClearing/business-day`,
            { headers: this.getHeaders() }
        );
    }

    startBusinessDay(): Observable<StartDayResponse> {
        return this.http.post<StartDayResponse>(
            `${this.apiUrl}/api/OutwardClearing/start-business-day`,
            {},
            { headers: this.getHeaders() }
        );
    }
}
