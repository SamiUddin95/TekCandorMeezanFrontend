import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import Swal from 'sweetalert2';
import { ReturnMemoReportService, ReturnMemoReportItem, ReturnMemoReportListResponse } from '../../../../../services/return-memo-report.service';
import { BranchService, BranchItem } from '../../../../../services/branch.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-return-memo-report',
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './return-memo-report.component.html',
  styleUrl: './return-memo-report.component.scss'
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
  selectedBranchId: number | null = null;
  accountNumber: string = '';

  // Data
  reportData: ReturnMemoReportItem[] = [];
  branches: BranchItem[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private returnMemoReportService: ReturnMemoReportService,
    private branchService: BranchService
  ) {}

  ngOnInit() {
    this.loadBranches();
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
}
