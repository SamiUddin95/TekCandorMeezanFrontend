import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import Swal from 'sweetalert2';
import { ClearingLogReportService, ClearingLogReportItem, ClearingLogReportListResponse } from '../../../../../services/clearing-log-report.service';
import { HubService, HubItem } from '../../../../../services/hub.service';
import { CycleService, CycleItem } from '../../../../../services/cycle.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-clearing-log-report',
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './clearing-log-report.component.html',
  styleUrl: './clearing-log-report.component.scss'
})
export class ClearingLogReportComponent implements OnInit, OnDestroy {
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;
  isLoading: boolean = false;

  // Filter properties
  fromDate: string = '';
  toDate: string = '';
  selectedHubId: number | null = null;
  selectedCycleId: number | null = null;

  // Data
  reportData: ClearingLogReportItem[] = [];
  hubs: HubItem[] = [];
  cycles: CycleItem[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private clearingLogReportService: ClearingLogReportService,
    private hubService: HubService,
    private cycleService: CycleService
  ) {}

  ngOnInit() {
    this.loadHubs();
    this.loadCycles();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadHubs() {
    const subscription = this.hubService.getHubs(1, 1000).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.hubs = response.data.items;
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
    const subscription = this.clearingLogReportService.getClearingLogReport(
      this.currentPage,
      this.pageSize,
      this.fromDate || undefined,
      this.toDate || undefined,
      this.selectedHubId || undefined,
      this.selectedCycleId || undefined
    ).subscribe({
      next: (response: ClearingLogReportListResponse) => {
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
    this.selectedHubId = null;
    this.selectedCycleId = null;
    this.currentPage = 1;
    this.reportData = [];
    this.totalRecords = 0;
  }

  get paginatedReportData(): ClearingLogReportItem[] {
    return this.reportData;
  }

  formatDateTime(dateTimeString: string): string {
    if (!dateTimeString) return '-';
    return dateTimeString;
  }
}
