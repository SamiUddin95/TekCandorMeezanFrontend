import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerRefresh, tablerSearch } from '@ng-icons/tabler-icons';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { SpinnerComponent } from '@app/components/spinner/spinner.component';
import Swal from 'sweetalert2';
import { BranchwiseReportService, BranchwiseReportItem, BranchwiseReportListResponse } from '../../../../../services/branchwise-report.service';
import { BranchService, BranchItem, FilterBranchItem } from '../../../../../services/branch.service';
import { SSRSReportService } from '../../../../../services/ssrs-report.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-branchwise-report',
  imports: [CommonModule, FormsModule, NgIcon, PaginationComponent, SpinnerComponent],
  providers: [provideIcons({ tablerRefresh, tablerSearch })],
  templateUrl: './branchwise-report.component.html',
  styleUrl: './branchwise-report.component.scss'
})
export class BranchwiseReportComponent implements OnInit, OnDestroy, AfterViewInit {
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;
  isLoading: boolean = false;

  // Filter properties
  fromDate: string = '';
  toDate: string = '';
  selectedBranchId: string | null = null;

  // Data
  reportData: BranchwiseReportItem[] = [];
  branches: FilterBranchItem[] = [];

  private subscriptions = new Subscription();

  constructor(
    private branchwiseReportService: BranchwiseReportService,
    private branchService: BranchService,
    private ssrsReportService: SSRSReportService
  ) {}

  ngOnInit() {
    this.loadBranches();
    this.loadReport();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit() {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new (window as any).bootstrap.Tooltip(tooltipTriggerEl);
    });
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
    const subscription = this.branchwiseReportService.getBranchwiseReport(
      this.currentPage,
      this.pageSize,
      this.fromDate || undefined,
      this.toDate || undefined,
      this.selectedBranchId || undefined
    ).subscribe({
      next: (response: BranchwiseReportListResponse) => {
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
    this.selectedBranchId = null;
    this.currentPage = 1;
    this.loadReport();
  }

  get paginatedReportData(): BranchwiseReportItem[] {
    return this.reportData;
  }

  exportReport(format: 'PDF' | 'EXCEL' | 'CSV'): void {
    // Prepare parameters for the SSRS report
    const parameters: { [key: string]: any } = {};
    
    if (this.fromDate) {
      parameters['FromDate'] = this.fromDate;
    }
    
    if (this.toDate) {
      parameters['ToDate'] = this.toDate;
    }
    
    if (this.selectedBranchId) {
      parameters['BranchCode'] = this.selectedBranchId;
    }

    // Show loading indicator
    Swal.fire({
      title: 'Exporting...',
      text: `Please wait while we export the ${format} report.`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Call the SSRS service
    this.subscriptions.add(
      this.ssrsReportService.exportBranchWiseReport(format, parameters).subscribe({
        next: (httpResponse) => {
          Swal.close();
          
          // Debug: Log the actual response
          console.log('SSRS HttpResponse:', httpResponse);
          
          // Handle different response scenarios
          if (httpResponse.status === 200) {
            const response = httpResponse.body;
            
            // Scenario 1: Backend returns JSON with file data
            if (response && response.status === 'success' && response.data && response.data.fileData) {
              this.downloadReportFile(response.data.fileData, format, response.data.fileName);
            }
            // Scenario 2: Backend returns file directly as blob
            else if (httpResponse.body instanceof Blob) {
              this.downloadBlobFile(httpResponse.body, format);
            }
            // Scenario 3: Backend returns base64 string directly
            else if (typeof response === 'string' && response.length > 100) {
              this.downloadReportFile(response, format);
            }
            // Scenario 4: Backend returns different structure
            else {
              console.log('Unexpected response structure:', response);
              Swal.fire({
                icon: 'error',
                title: 'Export Failed',
                text: 'Unexpected response format from server. Please check console for details.'
              });
            }
          } else {
            console.log('HTTP Error Response:', httpResponse);
            Swal.fire({
              icon: 'error',
              title: 'Export Failed',
              text: `Server returned status: ${httpResponse.status}`
            });
          }
        },
        error: (error) => {
          Swal.close();
          console.error('Export error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Export Failed',
            text: 'An error occurred while exporting the report. Please try again.'
          });
        }
      })
    );
  }

  private downloadReportFile(base64Data: string, format: string, fileName?: string): void {
    // Determine content type and file extension based on format
    let contentType = '';
    let fileExtension = '';
    
    switch (format) {
      case 'PDF':
        contentType = 'application/pdf';
        fileExtension = '.pdf';
        break;
      case 'EXCEL':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = '.xlsx';
        break;
      case 'CSV':
        contentType = 'text/csv';
        fileExtension = '.csv';
        break;
    }

    // Download the file
    const finalFileName = fileName || `BranchWiseReport_${new Date().toISOString().split('T')[0]}${fileExtension}`;
    this.ssrsReportService.downloadFile(base64Data, finalFileName, contentType);

    // Show success message
    Swal.fire({
      icon: 'success',
      title: 'Export Successful',
      text: `The ${format} report has been downloaded successfully.`,
      timer: 2000,
      showConfirmButton: false
    });
  }

  private downloadBlobFile(blob: Blob, format: string): void {
    // Determine file extension based on format
    let fileExtension = '';
    
    switch (format) {
      case 'PDF':
        fileExtension = '.pdf';
        break;
      case 'EXCEL':
        fileExtension = '.xlsx';
        break;
      case 'CSV':
        fileExtension = '.csv';
        break;
    }

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BranchWiseReport_${new Date().toISOString().split('T')[0]}${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Show success message
    Swal.fire({
      icon: 'success',
      title: 'Export Successful',
      text: `The ${format} report has been downloaded successfully.`,
      timer: 2000,
      showConfirmButton: false
    });
  }
}
