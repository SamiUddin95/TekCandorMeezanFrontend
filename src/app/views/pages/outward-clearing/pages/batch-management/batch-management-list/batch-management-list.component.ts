import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FilterService, BranchItem } from '../../../services/filter.service';
import { BatchDetails, BatchManagementService, BatchDateRangeWithStatisticsResponse } from '../../../services/batch-management.service';
import { SpinnerComponent } from '@app/components/spinner/spinner.component';

export interface BatchItem {
    batchId: string;
    branch: string;
    branchname: string;
    createdBy: string;
    instruments: number;
    totalAmount: number;
    status: 'Authorized' | 'Balanced' | 'Draft' | 'Rejected';
    createdDate: string;
}

@Component({
    selector: 'app-batch-management-list',
    imports: [CommonModule, FormsModule, SpinnerComponent],
    templateUrl: './batch-management-list.component.html',
    styleUrl: './batch-management-list.component.scss'
})
export class BatchManagementListComponent implements OnInit {

    searchQuery = '';
    fromDate = '';
    toDate = '';
    selectedBranch = '';
    selectedStatus = '';
    currentPage = 1;
    pageSize = 5;
    isLoading = false;

    isCreateBatchModalOpen = false;
    isCreatingBatch = false;
    createBatchBranch = '';
    createBatchError = '';
    availableBranches: BranchItem[] = [];

    stats = {
        totalBatches: 0,
        pendingAuth: 0,
        authorizedValue: 0,
        processingExceptions: 0
    };

    batches: BatchItem[] = [];

    constructor(
        private router: Router,
        private filterService: FilterService,
        private batchManagementService: BatchManagementService
    ) {}

    ngOnInit(): void {
        this.setTodayDate();
        this.loadBranches();
        this.loadBatchesWithStatistics();
    }

    get filteredBatches(): BatchItem[] {
        let result = [...this.batches];
        const q = this.searchQuery.trim().toLowerCase();
        if (q) {
            result = result.filter(b =>
                b.batchId.toLowerCase().includes(q) ||
                b.branch.toLowerCase().includes(q) ||
                b.createdBy.toLowerCase().includes(q)
            );
        }
        if (this.selectedStatus) {
            result = result.filter(b => b.status === this.selectedStatus);
        }
        return result;
    }

    get totalResults(): number {
        return this.filteredBatches.length;
    }

    get totalPages(): number {
        return Math.ceil(this.totalResults / this.pageSize) || 1;
    }

    get paginatedBatches(): BatchItem[] {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.filteredBatches.slice(start, start + this.pageSize);
    }

    get pageNumbers(): number[] {
        const pages: number[] = [];
        for (let i = 1; i <= this.totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }

    onCreateNewBatch(): void {
        this.isCreateBatchModalOpen = true;
        this.createBatchError = '';
    }

    onEditBatch(batchId: string): void {
        sessionStorage.setItem('outward.activeBatchId', batchId);
        this.router.navigate(['/pages/outward-clearing/batch-management/new'], {
            queryParams: { batchId: batchId, mode: 'edit' }
        });
    }

    onCloseCreateBatchModal(): void {
        this.isCreateBatchModalOpen = false;
        this.createBatchBranch = '';
        this.createBatchError = '';
    }

    onSaveCreateBatch(): void {
        if (!this.createBatchBranch) {
            this.createBatchError = 'Please select a branch.';
            return;
        }

        this.isCreatingBatch = true;
        this.createBatchError = '';

        this.batchManagementService.createBatch({
            branch: this.createBatchBranch,
            maxInstruments: 0
        }).subscribe({
            next: (response) => {
                this.isCreatingBatch = false;

                if (response.status === 'success' && response.data?.batchId) {
                    const createdBatchId = response.data.batchId;
                    sessionStorage.setItem('outward.activeBatchId', createdBatchId);
                    this.onCloseCreateBatchModal();
                    this.router.navigate(['/pages/outward-clearing/batch-management/new'], {
                        queryParams: { batchId: createdBatchId }
                    });
                    return;
                }

                this.createBatchError = response.errorMessage || 'Failed to create batch.';
            },
            error: (error) => {
                this.isCreatingBatch = false;
                this.createBatchError = error?.error?.errorMessage || 'Failed to create batch. Please try again.';
            }
        });
    }

    private loadBatchesWithStatistics(): void {
        this.isLoading = true;
        const fromDate = this.fromDate || this.getTodayDateString();
        const toDate = this.getNextDateString(fromDate);
        this.toDate = toDate;

        this.batchManagementService.getBatchesWithStatistics(fromDate, toDate).subscribe({
            next: (response: BatchDateRangeWithStatisticsResponse) => {
                this.isLoading = false;
                if (response.status === 'success' && response.data) {
                    this.batches = response.data.batches.map(item => this.mapBatchItem(item));
                    this.stats = {
                        totalBatches: response.data.statistics.totalBatchesToday,
                        pendingAuth: response.data.statistics.pendingAuthorization,
                        authorizedValue: response.data.statistics.authorizedValue,
                        processingExceptions: response.data.statistics.processingExceptions
                    };
                } else {
                    this.batches = [];
                }
            },
            error: () => {
                this.isLoading = false;
                this.batches = [];
            }
        });
    }

    private mapBatchItem(item: BatchDetails): BatchItem {
        return {
            batchId: item.batchId,
            branchname: item.branchName,
            branch: item.branch,
            createdBy: item.createdBy,
            instruments: item.totalInstruments,
            totalAmount: item.totalAmount,
            status: this.normalizeStatus(item.status),
            createdDate: this.formatDateTime(item.createdAt)
        };
    }

    private normalizeStatus(status: string): 'Authorized' | 'Balanced' | 'Draft' | 'Rejected' {
        if (status === 'Authorized') return 'Authorized';
        if (status === 'Balanced') return 'Balanced';
        if (status === 'Rejected') return 'Rejected';
        return 'Draft';
    }

    private setTodayDate(): void {
        const today = this.getTodayDateString();
        this.fromDate = today;
        this.toDate = this.getNextDateString(today);
    }

    private getTodayDateString(): string {
        const today = new Date();
        return this.formatDateOnly(today);
    }

    private getNextDateString(dateString: string): string {
        const [year, month, day] = dateString.split('-').map(Number);
        const nextDate = new Date(year, (month || 1) - 1, day || 1);
        nextDate.setDate(nextDate.getDate() + 1);
        return this.formatDateOnly(nextDate);
    }

    private formatDateOnly(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private formatDateTime(dateTime: string): string {
        if (!dateTime) return '-';
        const date = new Date(dateTime);
        if (Number.isNaN(date.getTime())) return dateTime;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    onRefresh(): void {
        this.searchQuery = '';
        this.selectedStatus = '';
        this.currentPage = 1;
        this.setTodayDate();
        this.loadBatchesWithStatistics();
    }

    onSearch(): void {
        this.currentPage = 1;
        this.loadBatchesWithStatistics();
    }

    private loadBranches(): void {
        this.filterService.getBranches().subscribe({
            next: (response) => {
                if (response.status === 'success') {
                    this.availableBranches = response.data.branches;
                } else {
                    this.availableBranches = [];
                }
            },
            error: () => {
                this.availableBranches = [];
            }
        });
    }

    formatAmount(val: number): string {
        if (val >= 1000000) {
            return '$' + (val / 1000000).toFixed(1) + 'M';
        }
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    formatTableAmount(val: number): string {
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
}
