import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface BusinessDateItem {
    id: number;
    businessDate: string;
    isActive: boolean;
    startedBy: string;
    startedAt: string;
}

export interface BusinessDateRequest {
    id: number;
    businessDate: string;
    isActive: boolean;
    startedBy: string;
    startedAt: string;
}

export interface BusinessDateGetResponse {
    status: string;
    data: {
        items: BusinessDateItem[];
        totalCount: number;
    };
    statusCode: number;
    errorMessage: string | null;
}

export interface BusinessDatePostResponse {
    status: string;
    data: BusinessDateItem;
    statusCode: number;
    errorMessage: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class StartBusinessDayService {

    private apiUrl = environment.apiUrl;
    private businessDayStartedSubject = new BehaviorSubject<boolean | null>(null);

    businessDayStarted$ = this.businessDayStartedSubject.asObservable();

    constructor(private http: HttpClient) { }

    getBusinessDate(): Observable<BusinessDateGetResponse> {
        return this.http.get<BusinessDateGetResponse>(`${this.apiUrl}/outward/BusinessDate`);
    }

    startBusinessDate(payload: BusinessDateRequest): Observable<BusinessDatePostResponse> {
        return this.http.post<BusinessDatePostResponse>(`${this.apiUrl}/outward/BusinessDate`, payload);
    }

    setBusinessDayStatus(isStarted: boolean): void {
        this.businessDayStartedSubject.next(isStarted);
    }

    syncBusinessDayStatus(): void {
        this.getBusinessDate().subscribe({
            next: (response) => {
                const latest = response?.data?.items?.[0];
                this.businessDayStartedSubject.next(!!latest?.isActive);
            },
            error: () => {
                this.businessDayStartedSubject.next(null);
            }
        });
    }
}
