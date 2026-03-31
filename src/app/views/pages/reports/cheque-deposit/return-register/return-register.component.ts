import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { SpinnerComponent } from '@app/components/spinner/spinner.component';
import Swal from 'sweetalert2';
import { ReturnRegisterService, ReturnRegisterItem, ReturnRegisterListResponse } from '../../../../../services/return-register.service';
import { BranchService, BranchItem, FilterBranchItem } from '../../../../../services/branch.service';
import { CycleService, CycleItem } from '../../../../../services/cycle.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-return-register',
  imports: [CommonModule, FormsModule, PaginationComponent, SpinnerComponent],
  templateUrl: './return-register.component.html',
  styleUrl: './return-register.component.scss'
})
export class ReturnRegisterComponent implements OnInit, OnDestroy {
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;
  isLoading: boolean = false;

  // Filter properties
  accountNumber: string = '';
  selectedBranchId: string | null = null;
  fromDate: string = '';
  toDate: string = '';
  status: string = '';
  selectedCycleId: number | null = null;

  // Data
  reportData: ReturnRegisterItem[] = [];
  branches: FilterBranchItem[] = [];
  cycles: CycleItem[] = [];

  // Status options (you can adjust these based on your requirements)
  statusOptions: string[] = ['Pending', 'Approved', 'Rejected', 'Processed'];

  private subscriptions: Subscription[] = [];

  constructor(
    private returnRegisterService: ReturnRegisterService,
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
    const subscription = this.returnRegisterService.getReturnRegisterReport(
      this.currentPage,
      this.pageSize,
      this.accountNumber || undefined,
      this.selectedBranchId || undefined,
      this.fromDate || undefined,
      this.toDate || undefined,
      this.status || undefined,
      this.selectedCycleId || undefined
    ).subscribe({
      next: (response: ReturnRegisterListResponse) => {
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
    this.accountNumber = '';
    this.selectedBranchId = null;
    this.fromDate = '';
    this.toDate = '';
    this.status = '';
    this.selectedCycleId = null;
    this.currentPage = 1;
    this.reportData = [];
    this.totalRecords = 0;
  }

  get paginatedReportData(): ReturnRegisterItem[] {
    return this.reportData;
  }

  formatDateTime(dateTimeString: string): string {
    if (!dateTimeString) return '-';
    return dateTimeString;
  }
}
