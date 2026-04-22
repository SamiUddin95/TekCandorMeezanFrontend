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
    private businessDateSubject = new BehaviorSubject<string | null>(null);

    businessDayStarted$ = this.businessDayStartedSubject.asObservable();
    businessDate$ = this.businessDateSubject.asObservable();

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

    setBusinessDate(date: string | null): void {
        this.businessDateSubject.next(date);
    }

    setBusinessDayState(isStarted: boolean, date: string | null): void {
        this.businessDayStartedSubject.next(isStarted);
        this.businessDateSubject.next(isStarted ? date : null);
    }

    /**
     * Clearing date = business date + 2 days. If it lands on a weekend,
     * roll forward to the next Monday.
     */
    getClearingDate(businessDate: string | Date | null): Date | null {
        if (!businessDate) return null;
        const base = businessDate instanceof Date ? new Date(businessDate.getTime()) : new Date(businessDate);
        if (Number.isNaN(base.getTime())) return null;

        base.setDate(base.getDate() + 2);
        const day = base.getDay();
        if (day === 6) base.setDate(base.getDate() + 2);
        else if (day === 0) base.setDate(base.getDate() + 1);
        return base;
    }

    syncBusinessDayStatus(): void {
        this.getBusinessDate().subscribe({
            next: (response) => {
                const latest = response?.data?.items?.[0];
                const isActive = !!latest?.isActive;
                this.businessDayStartedSubject.next(isActive);
                this.businessDateSubject.next(isActive ? (latest?.businessDate || null) : null);
            },
            error: () => {
                this.businessDayStartedSubject.next(null);
                this.businessDateSubject.next(null);
            }
        });
    }
}
