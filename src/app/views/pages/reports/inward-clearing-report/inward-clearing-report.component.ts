import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerRefresh, tablerSearch } from '@ng-icons/tabler-icons';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { SpinnerComponent } from '@app/components/spinner/spinner.component';
import Swal from 'sweetalert2';
import { Observable, Subscription } from 'rxjs';
import { InwardClearingReportService, InwardClearingReportItem, InwardClearingReportApiResponse } from '../../../../services/inward-clearing-report.service';
import { BranchService, FilterBranchItem, FilterStatusItem, FilterHubItem } from '../../../../services/branch.service';
import { SSRSReportService } from '../../../../services/ssrs-report.service';

@Component({
  selector: 'app-inward-clearing-report',
  imports: [CommonModule, FormsModule, NgIcon, PaginationComponent, SpinnerComponent],
  providers: [provideIcons({ tablerRefresh, tablerSearch })],
  templateUrl: './inward-clearing-report.component.html',
  styleUrls: ['./inward-clearing-report.component.scss']
})
export class InwardClearingReportComponent implements OnInit, OnDestroy {
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;
  isLoading: boolean = false;

  // Filter variables
  fromDate: string = '';
  toDate: string = '';
  chequeNumber: string = '';
  accountNumber: string = '';
  selectedBranchId: string = '';
  selectedStatus: string = '';
  selectedHubId: string = '';

  // Data
  inwardClearingRecords: InwardClearingReportItem[] = [];
  branches: FilterBranchItem[] = [];
  statuses: FilterStatusItem[] = [];
  hubs: FilterHubItem[] = [];

  private subscriptions = new Subscription();

  constructor(
    private inwardClearingReportService: InwardClearingReportService,
    private branchService: BranchService,
    private ssrsReportService: SSRSReportService
  ) {}

  ngOnInit(): void {
    this.loadBranches();
    this.loadStatuses();
    this.loadHubs();
    this.loadReport();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadBranches(): void {
    this.subscriptions.add(
      this.branchService.getFilterBranches().subscribe({
        next: (response: any) => {
          // Ensure response.data.branches is an array
          if (response && response.data && response.data.branches && Array.isArray(response.data.branches)) {
            this.branches = response.data.branches;
          } else {
            this.branches = [];
          }
        },
        error: (error: any) => {
          console.error('Error loading branches:', error);
          this.branches = [];
        }
      })
    );
  }

  loadStatuses(): void {
    this.subscriptions.add(
      this.branchService.getFilterStatuses().subscribe({
        next: (response: any) => {
          // Ensure response.data.statuses is an array
          if (response && response.data && response.data.statuses && Array.isArray(response.data.statuses)) {
            this.statuses = response.data.statuses;
          } else {
            this.statuses = [];
          }
        },
        error: (error: any) => {
          console.error('Error loading statuses:', error);
          this.statuses = [];
        }
      })
    );
  }

  loadHubs(): void {
    this.subscriptions.add(
      this.branchService.getFilterHubs().subscribe({
        next: (response: any) => {
          // Ensure response.data.hubs is an array
          if (response && response.data && response.data.hubs && Array.isArray(response.data.hubs)) {
            this.hubs = response.data.hubs;
          } else {
            this.hubs = [];
          }
        },
        error: (error: any) => {
          console.error('Error loading hubs:', error);
          this.hubs = [];
        }
      })
    );
  }

  loadReport(): void {
    this.isLoading = true;

    const filters = {
      dateFrom: this.fromDate || undefined,
      dateTo: this.toDate || undefined,
      chequeNumber: this.chequeNumber || undefined,
      accountNumber: this.accountNumber || undefined,
      branchId: this.selectedBranchId || undefined,
      status: this.selectedStatus !== 'all' ? this.selectedStatus : undefined,
      hubId: this.selectedHubId || undefined
    };

    this.subscriptions.add(
      this.inwardClearingReportService.getInwardClearingReport(
        this.currentPage,
        this.pageSize,
        filters
      ).subscribe({
        next: (response: InwardClearingReportApiResponse) => {
          if (response.status === 'success') {
            // Ensure items is an array
            if (response.data && response.data.items && Array.isArray(response.data.items)) {
              this.inwardClearingRecords = response.data.items;
            } else {
              this.inwardClearingRecords = [];
            }
            this.totalRecords = response.data.totalCount || 0;
            this.totalPages = response.data.totalPages || 0;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errorMessage || 'Failed to load report data'
            });
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading report:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load report data'
          });
          this.isLoading = false;
        }
      })
    );
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadReport();
  }

  onReset(): void {
    this.fromDate = '';
    this.toDate = '';
    this.chequeNumber = '';
    this.accountNumber = '';
    this.selectedBranchId = '';
    this.selectedStatus = 'all';
    this.selectedHubId = '';
    this.currentPage = 1;
    this.loadReport();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
    this.loadReport();
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  exportReport(format: 'PDF' | 'EXCEL' | 'CSV'): void {
    const parameters: { [key: string]: any } = {};
    if (this.fromDate) parameters['FromDate'] = this.fromDate;
    if (this.toDate) parameters['ToDate'] = this.toDate;
    if (this.accountNumber) parameters['AccountNumber'] = this.accountNumber;
    if (this.selectedBranchId) parameters['BranchCode'] = this.selectedBranchId;
    if (this.selectedStatus && this.selectedStatus !== 'all') parameters['Status'] = this.selectedStatus;
    if (this.selectedHubId) parameters['HubCode'] = this.selectedHubId;

    Swal.fire({ title: 'Exporting...', text: `Please wait while we export the ${format} report.`, allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

    this.subscriptions.add(
      this.ssrsReportService.exportInwardClearingReport(format, parameters).subscribe({
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
    const finalFileName = fileName || `InwardClearingReport_${new Date().toISOString().split('T')[0]}${fileExtension}`;
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
    link.download = `InwardClearingReport_${new Date().toISOString().split('T')[0]}${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    Swal.fire({ icon: 'success', title: 'Export Successful', text: `The ${format} report has been downloaded successfully.`, timer: 2000, showConfirmButton: false });
  }
}
