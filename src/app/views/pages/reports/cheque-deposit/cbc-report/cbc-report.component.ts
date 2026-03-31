import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { SpinnerComponent } from '@app/components/spinner/spinner.component';
import Swal from 'sweetalert2';
import { CBCReportService, CBCReportItem, CBCReportListResponse, StatusOption } from '../../../../../services/cbc-report.service';
import { BranchService, BranchItem, FilterBranchItem, FilterHubItem } from '../../../../../services/branch.service';
import { HubService, HubItem } from '../../../../../services/hub.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cbc-report',
  imports: [CommonModule, FormsModule, PaginationComponent, SpinnerComponent],
  templateUrl: './cbc-report.component.html',
  styleUrl: './cbc-report.component.scss'
})
export class CBCReportComponent implements OnInit, OnDestroy {
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;
  isLoading: boolean = false;

  // Filter properties
  fromDate: string = '';
  toDate: string = '';
  selectedBranchId: string | null = null;
  accountNumber: string = '';
  status: string = '';
  selectedHubId: string | null = null;

  // Data
  reportData: CBCReportItem[] = [];
  branches: FilterBranchItem[] = [];
  hubs: FilterHubItem[] = [];

  // Status options loaded from API
  statusOptions: StatusOption[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private cbcReportService: CBCReportService,
    private branchService: BranchService,
    private hubService: HubService
  ) {}

  ngOnInit() {
    this.loadBranches();
    this.loadHubs();
    this.loadStatuses();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
    this.subscriptions.push(subscription);
  }

  loadHubs() {
    const subscription = this.branchService.getFilterHubs().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.hubs = response.data.hubs;
        } else {
          console.error('Failed to load hubs:', response.errorMessage);
        }
      },
      error: (error) => {
        console.error('Error loading hubs:', error);
      }
    });
    this.subscriptions.push(subscription);
  }

  loadStatuses() {
    const subscription = this.cbcReportService.getStatuses().subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.statusOptions = response.data.statuses;
        } else {
          console.error('Failed to load statuses:', response.errorMessage);
        }
      },
      error: (error: any) => {
        console.error('Error loading statuses:', error);
      }
    });
    this.subscriptions.push(subscription);
  }

  loadReport() {
    this.isLoading = true;
    const subscription = this.cbcReportService.getCBCReport(
      this.currentPage,
      this.pageSize,
      this.fromDate || undefined,
      this.toDate || undefined,
      this.selectedBranchId || undefined,
      this.accountNumber || undefined,
      this.status || undefined,
      this.selectedHubId || undefined
    ).subscribe({
      next: (response: CBCReportListResponse) => {
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
    this.subscriptions.push(subscription);
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
    this.accountNumber = '';
    this.status = '';
    this.selectedHubId = null;
    this.currentPage = 1;
    this.reportData = [];
    this.totalRecords = 0;
  }

  get paginatedReportData(): CBCReportItem[] {
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
}
