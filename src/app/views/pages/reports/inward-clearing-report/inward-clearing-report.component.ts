import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { SpinnerComponent } from '@app/components/spinner/spinner.component';
import Swal from 'sweetalert2';
import { InwardClearingReportService, InwardClearingReportItem, InwardClearingReportListResponse } from '@app/services/inward-clearing-report.service';
import { BranchService, BranchItem, FilterBranchItem, FilterStatusItem, FilterHubItem } from '@app/services/branch.service';
import { HubService, HubItem } from '@app/services/hub.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inward-clearing-report',
  imports: [CommonModule, FormsModule, PaginationComponent, SpinnerComponent],
  templateUrl: './inward-clearing-report.component.html',
  styleUrl: './inward-clearing-report.component.scss'
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
    private hubService: HubService
  ) {}

  ngOnInit(): void {
    this.loadBranches();
    this.loadStatuses();
    this.loadHubs();
    this.loadReport();
  }

  ngOnDestroy(): void {
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
      dateFrom: this.fromDate,
      dateTo: this.toDate,
      chequeNumber: this.chequeNumber,
      accountNumber: this.accountNumber,
      branchId: this.selectedBranchId,
      status: this.selectedStatus !== 'all' ? this.selectedStatus : undefined,
      hubId: this.selectedHubId
    };

    this.subscriptions.add(
      this.inwardClearingReportService.getInwardClearingReport(this.currentPage, this.pageSize, filters).subscribe({
        next: (response: any) => {
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
            this.inwardClearingRecords = []; // Ensure array on error
            Swal.fire('Error', response.errorMessage || 'Failed to load report data', 'error');
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading report:', error);
          this.inwardClearingRecords = []; // Ensure array on error
          this.isLoading = false;
          Swal.fire('Error', 'Failed to load report data', 'error');
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

  exportToExcel(): void {
    // TODO: Implement Excel export functionality
    Swal.fire('Info', 'Excel export will be implemented soon', 'info');
  }

  exportToPdf(): void {
    // TODO: Implement PDF export functionality
    Swal.fire('Info', 'PDF export will be implemented soon', 'info');
  }
}
