import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerRefresh, tablerSearch } from '@ng-icons/tabler-icons';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { SpinnerComponent } from '@app/components/spinner/spinner.component';
import Swal from 'sweetalert2';
import { ReturnMemoReportService, ReturnMemoReportItem, ReturnMemoReportListResponse } from '../../../../../services/return-memo-report.service';
import { BranchService, BranchItem, FilterBranchItem } from '../../../../../services/branch.service';
import { SSRSReportService } from '../../../../../services/ssrs-report.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-return-memo-report',
  imports: [CommonModule, FormsModule, NgIcon, PaginationComponent, SpinnerComponent],
  providers: [provideIcons({ tablerRefresh, tablerSearch })],
  templateUrl: './return-memo-report.component.html',
  styleUrls: ['./return-memo-report.component.scss']
})
export class ReturnMemoReportComponent implements OnInit, OnDestroy {
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;
  isLoading: boolean = false;

  // Filter properties
  fromDate: string = '';
  toDate: string = '';
  chequeNumber: string = '';
  selectedBranchId: string | null = null;
  accountNumber: string = '';

  // Data
  reportData: ReturnMemoReportItem[] = [];
  branches: FilterBranchItem[] = [];

  private subscriptions = new Subscription();

  constructor(
    private returnMemoReportService: ReturnMemoReportService,
    private branchService: BranchService,
    private ssrsReportService: SSRSReportService
  ) {}

  ngOnInit() {
    this.loadBranches();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadBranches() {
    const subscription = this.branchService.getFilterBranches().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.branches = response.data.branches;
        } else {
          console.error('Failed to load branches:', response.errorMessage);
        }
      },
      error: (error) => {
        console.error('Error loading branches:', error);
      }
    });
    this.subscriptions.add(subscription);
  }

  loadReport() {
    this.isLoading = true;
    const subscription = this.returnMemoReportService.getReturnMemoReport(
      this.currentPage,
      this.pageSize,
      this.fromDate || undefined,
      this.toDate || undefined,
      this.chequeNumber || undefined,
      this.selectedBranchId || undefined,
      this.accountNumber || undefined
    ).subscribe({
      next: (response: ReturnMemoReportListResponse) => {
        if (response.status === 'success') {
          this.reportData = response.data.items;
          this.totalRecords = response.data.totalCount;
          this.totalPages = response.data.totalPages;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.errorMessage || 'Failed to load report'
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading report:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load report. Please try again.'
        });
        this.isLoading = false;
      }
    });
    this.subscriptions.add(subscription);
  }

  onPageChange(event: { page: number; pageSize: number }) {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
    this.loadReport();
  }

  onSearch() {
    this.currentPage = 1;
    this.loadReport();
  }

  onReset() {
    this.fromDate = '';
    this.toDate = '';
    this.chequeNumber = '';
    this.selectedBranchId = null;
    this.accountNumber = '';
    this.currentPage = 1;
    this.reportData = [];
    this.totalRecords = 0;
  }

  get paginatedReportData(): ReturnMemoReportItem[] {
    return this.reportData;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  exportReport(format: 'PDF' | 'EXCEL' | 'CSV'): void {
    const parameters: { [key: string]: any } = {};
    if (this.fromDate) parameters['FromDate'] = this.fromDate;
    if (this.toDate) parameters['ToDate'] = this.toDate;
    if (this.chequeNumber) parameters['ChequeNumber'] = this.chequeNumber;
    if (this.selectedBranchId) parameters['BranchCode'] = this.selectedBranchId;
    if (this.accountNumber) parameters['AccountNumber'] = this.accountNumber;

    Swal.fire({ title: 'Exporting...', text: `Please wait while we export the ${format} report.`, allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

    this.subscriptions.add(
      this.ssrsReportService.exportReturnMemoReport(format, parameters).subscribe({
        next: (httpResponse) => {
          Swal.close();
          console.log('SSRS HttpResponse:', httpResponse);
          if (httpResponse.status === 200) {
            const response = httpResponse.body;
            if (response && response.status === 'success' && response.data && response.data.fileData) {
              this.downloadReportFile(response.data.fileData, format, response.data.fileName);
            } else if (httpResponse.body instanceof Blob) {
              this.downloadBlobFile(httpResponse.body, format);
            } else if (typeof response === 'string' && response.length > 100) {
              this.downloadReportFile(response, format);
            } else {
              Swal.fire({ icon: 'error', title: 'Export Failed', text: 'Unexpected response format from server.' });
            }
          } else {
            Swal.fire({ icon: 'error', title: 'Export Failed', text: `Server returned status: ${httpResponse.status}` });
          }
        },
        error: (error) => {
          Swal.close();
          console.error('Export error:', error);
          Swal.fire({ icon: 'error', title: 'Export Failed', text: 'An error occurred while exporting the report.' });
        }
      })
    );
  }

  private downloadReportFile(base64Data: string, format: string, fileName?: string): void {
    let contentType = '', fileExtension = '';
    switch (format) {
      case 'PDF': contentType = 'application/pdf'; fileExtension = '.pdf'; break;
      case 'EXCEL': contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; fileExtension = '.xlsx'; break;
      case 'CSV': contentType = 'text/csv'; fileExtension = '.csv'; break;
    }
    const finalFileName = fileName || `ReturnMemoReport_${new Date().toISOString().split('T')[0]}${fileExtension}`;
    this.ssrsReportService.downloadFile(base64Data, finalFileName, contentType);
    Swal.fire({ icon: 'success', title: 'Export Successful', text: `The ${format} report has been downloaded successfully.`, timer: 2000, showConfirmButton: false });
  }

  private downloadBlobFile(blob: Blob, format: string): void {
    let fileExtension = '';
    switch (format) {
      case 'PDF': fileExtension = '.pdf'; break;
      case 'EXCEL': fileExtension = '.xlsx'; break;
      case 'CSV': fileExtension = '.csv'; break;
    }
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ReturnMemoReport_${new Date().toISOString().split('T')[0]}${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    Swal.fire({ icon: 'success', title: 'Export Successful', text: `The ${format} report has been downloaded successfully.`, timer: 2000, showConfirmButton: false });
  }
}
