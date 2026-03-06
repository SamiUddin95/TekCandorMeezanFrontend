import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadFileService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Get auth headers
  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Upload file API
  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    console.log('Upload attempt:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      url: `${this.apiUrl}/ChequeDeposit/upload`,
      token: sessionStorage.getItem('access_token') ? 'Token exists' : 'No token'
    });

    return this.http.post(
      `${this.apiUrl}/ChequeDeposit/upload`,
      formData
    );
  }

  // Get current user from session storage
  private getCurrentUserName(): string {
    try {
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.username || user.email || user.name || 'Unknown';
      }
    } catch (error) {
      console.error('Error getting user from session storage:', error);
    }
    return 'Unknown';
  }

  // Process uploaded file
  processUploadedFile(fileName: string, services?: any): Observable<any> {
    const payload = {
      fileName: fileName,
      services: services || {},
      processedBy: this.getCurrentUserName()
    };

    return this.http.post(`${this.apiUrl}/ChequeDeposit/process-upload`, payload, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Get upload history
  getUploadHistory(pageNumber: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/ChequeDeposit/upload-history?pageNumber=${pageNumber}&pageSize=${pageSize}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Get upload details
  getUploadDetails(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/ChequeDeposit/upload/${id}/details`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Start Service API
  startService(): Observable<any> {
    return this.http.post(`${this.apiUrl}/ChequeDeposit/start-service`, { 
      startedBy: this.getCurrentUserName()
    }, { 
      headers: this.getAuthHeaders() 
    });
  }

  // SS Card Service API
  ssCardService(): Observable<any> {
    return this.http.post(`${this.apiUrl}/ChequeDeposit/ss-card-service`, { 
      processedBy: this.getCurrentUserName()
    }, { 
      headers: this.getAuthHeaders() 
    });
  }

  // SFTP Image Upload API
  sftpImageUpload(): Observable<any> {
    return this.http.post(`${this.apiUrl}/ChequeDeposit/sftp-image-upload`, { 
      uploadedBy: this.getCurrentUserName()
    }, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Delete uploaded file
  deleteUpload(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/ChequeDeposit/upload/${id}`, { 
      headers: this.getAuthHeaders() 
    });
  }
}
