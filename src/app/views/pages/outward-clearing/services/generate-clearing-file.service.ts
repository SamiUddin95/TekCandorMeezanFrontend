import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GenerateClearingFileService {

    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    generateClearingFile(receiverBranchCode: string, date: string): Observable<Blob> {
        const url = `${this.apiUrl}/outward/ChequeInfo/generate-file?receiverBranchCode=${receiverBranchCode}&date=${date}`;
        return this.http.get(url, { responseType: 'blob' });
    }

    generateClearingFileByHub(hubCode: string, date: string): Observable<Blob> {
        const url = `${this.apiUrl}/outward/ChequeInfo/generate-file-hubwise?hubcode=${hubCode}&date=${date}`;
        return this.http.get(url, { responseType: 'blob' });
    }
}
