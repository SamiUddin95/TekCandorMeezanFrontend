import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LicenseStatusData {
    isValid: boolean;
    isExpired: boolean;
    expiryDate: string;
    daysRemaining: number;
    message: string;
}

export interface LicenseStatusResponse {
    status: string;
    data: LicenseStatusData;
    statusCode: number;
    errorMessage: string | null;
}

export interface LicenseUpdateRequest {
    encryptedKey: string;
}

export interface LicenseUpdateResponse {
    status: string;
    data: any;
    statusCode: number;
    errorMessage: string | null;
}

@Injectable({ providedIn: 'root' })
export class LicenseService {
    private apiUrl = environment.apiUrl;
    private readonly WARNING_THRESHOLD_DAYS = 45;

    private licenseStatusSubject = new BehaviorSubject<LicenseStatusData | null>(null);
    public licenseStatus$ = this.licenseStatusSubject.asObservable();

    constructor(private http: HttpClient) {}

    getLicenseStatus(): Observable<LicenseStatusResponse> {
        return this.http.get<LicenseStatusResponse>(`${this.apiUrl}/License/status`).pipe(
            tap((response) => {
                if (response?.status === 'success' && response?.data) {
                    this.licenseStatusSubject.next(response.data);
                }
            })
        );
    }

    updateLicense(encryptedKey: string): Observable<LicenseUpdateResponse> {
        const payload: LicenseUpdateRequest = { encryptedKey };
        return this.http.post<LicenseUpdateResponse>(`${this.apiUrl}/License/update`, payload);
    }

    setStatus(status: LicenseStatusData | null): void {
        this.licenseStatusSubject.next(status);
    }

    getCurrentStatus(): LicenseStatusData | null {
        return this.licenseStatusSubject.value;
    }

    shouldShowWarning(status: LicenseStatusData | null): boolean {
        if (!status) return false;
        // Show warning if license is expired OR if it will expire within threshold days
        return status.isExpired || status.daysRemaining <= this.WARNING_THRESHOLD_DAYS;
    }

    formatExpiryDate(dateStr: string): string {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (Number.isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
    }

    buildWarningMessage(status: LicenseStatusData): string {
        const formattedDate = this.formatExpiryDate(status.expiryDate);
        return `Application license will expire on ${formattedDate} (${status.daysRemaining} day(s) left). Please renew.`;
    }
}
