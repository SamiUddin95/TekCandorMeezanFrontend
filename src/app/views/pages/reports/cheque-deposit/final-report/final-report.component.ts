import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import Swal from 'sweetalert2';
import { FinalReportService, FinalReportItem, FinalReportListResponse } from '../../../../../services/final-report.service';
import { BranchService, BranchItem } from '../../../../../services/branch.service';
import { CycleService, CycleItem } from '../../../../../services/cycle.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-final-report',
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './final-report.component.html',
  styleUrl: './final-report.component.scss'
})
export class FinalReportComponent implements OnInit, OnDestroy {
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;
  isLoading: boolean = false;

  // Filter properties
  fromDate: string = '';
  toDate: string = '';
  selectedCycleId: number | null = null;
  selectedBranchId: number | null = null;

  // Data
  reportData: FinalReportItem[] = [];
  branches: BranchItem[] = [];
  cycles: CycleItem[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private finalReportService: FinalReportService,
    private branchService: BranchService,
    private cycleService: CycleService
  ) {}

  ngOnInit() {
    this.loadBranches();
    this.loadCycles();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadBranches() {
    const subscription = this.branchService.getBranches(1, 1000).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.branches = response.data.items;
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

  loadCycles() {
    const subscription = this.cycleService.getCycles(1, 1000).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.cycles = response.data.items;
        } else {
          console.error('Failed to load cycles:', response.errorMessage);
        }
      },
      error: (error) => {
        console.error('Error loading cycles:', error);
      }
    });
    this.subscriptions.push(subscription);
  }

  loadReport() {
    this.isLoading = true;
    const subscription = this.finalReportService.getFinalReport(
      this.currentPage,
      this.pageSize,
      this.fromDate || undefined,
      this.toDate || undefined,
      this.selectedCycleId || undefined,
      this.selectedBranchId || undefined
    ).subscribe({
      next: (response: FinalReportListResponse) => {
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
    this.selectedCycleId = null;
    this.selectedBranchId = null;
    this.currentPage = 1;
    this.reportData = [];
    this.totalRecords = 0;
  }

  get paginatedReportData(): FinalReportItem[] {
    return this.reportData;
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'R':
        return 'Returned';
      case 'P':
        return 'Processed';
      case 'A':
        return 'Approved';
      default:
        return status || '-';
    }
  }
}
