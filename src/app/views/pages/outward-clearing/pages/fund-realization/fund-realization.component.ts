import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FundRealizationItem, FundRealizationService } from '../../services/fund-realization.service';
import { PaginationComponent } from '@app/components/pagination/pagination.component';

export interface BranchRealizationItem {
    id: number;
    branchCode: string;
    branchName: string;
    totalAmount: number;
    instrumentCount: number;
    status: 'Ready' | 'Processing' | 'Completed';
    selected: boolean;
}

@Component({
    selector: 'app-fund-realization',
    imports: [CommonModule, FormsModule, PaginationComponent],
    templateUrl: './fund-realization.component.html',
    styleUrl: './fund-realization.component.scss'
})
export class FundRealizationComponent implements OnInit {

    searchTerm = '';
    selectedDate = '';
    currentPage = 1;
    pageSize = 10;
    totalRecords = 0;
    isLoading = false;
    loadError = '';

    branches: BranchRealizationItem[] = [];

    constructor(private fundRealizationService: FundRealizationService) {}

    ngOnInit(): void {
        this.selectedDate = this.today();
        this.loadFundRealizationList();
    }

    private loadFundRealizationList(): void {
        this.isLoading = true;
        this.loadError = '';

        this.fundRealizationService.getFundRealizationList(
            this.currentPage,
            this.pageSize,
            this.selectedDate,
            this.getNextDate(this.selectedDate)
        ).subscribe({
            next: (response) => {
                this.isLoading = false;
                const items = response?.data?.items ?? [];
                this.branches = items.map((item, index) => this.mapToBranch(item, index));
                this.totalRecords = response?.data?.totalCount || 0;
            },
            error: () => {
                this.isLoading = false;
                this.branches = [];
                this.totalRecords = 0;
                this.loadError = 'Unable to load fund realization list.';
            }
        });
    }

    private mapToBranch(item: FundRealizationItem, index: number): BranchRealizationItem {
        return {
            id: index + 1,
            branchCode: item.receiverBranchCode || '—',
            branchName: item.branchName || '—',
            totalAmount: item.totalAmount || 0,
            instrumentCount: item.chequeCount || 0,
            status: 'Ready',
            selected: false
        };
    }

    private today(): string {
        const d = new Date();
        return d.toISOString().split('T')[0];
    }

    private getNextDate(dateStr: string): string {
        if (!dateStr) {
            return '';
        }

        const date = new Date(dateStr);
        if (Number.isNaN(date.getTime())) {
            return '';
        }

        date.setDate(date.getDate() + 1);
        return date.toISOString().split('T')[0];
    }

    get filtered(): BranchRealizationItem[] {
        const q = this.searchTerm.trim().toLowerCase();
        if (!q) return this.branches;
        return this.branches.filter(b =>
            b.branchCode.toLowerCase().includes(q) ||
            b.branchName.toLowerCase().includes(q)
        );
    }

    get pagedBranches(): BranchRealizationItem[] {
        return this.filtered;
    }

    get selectedBranches(): BranchRealizationItem[] {
        return this.branches.filter(b => b.selected);
    }

    get allPageSelected(): boolean {
        return this.pagedBranches.length > 0 && this.pagedBranches.every(b => b.selected);
    }

    get selectionTotal(): number {
        return this.selectedBranches.reduce((sum, b) => sum + b.totalAmount, 0);
    }

    get selectionInstruments(): number {
        return this.selectedBranches.reduce((sum, b) => sum + b.instrumentCount, 0);
    }

    toggleSelectAll(event: Event): void {
        const checked = (event.target as HTMLInputElement).checked;
        this.pagedBranches.forEach(b => b.selected = checked);
    }

    resetSelection(): void {
        this.branches.forEach(b => b.selected = false);
    }

    onFilterChange(): void {
        this.currentPage = 1;
    }

    onSearch(): void {
        this.currentPage = 1;
        this.loadFundRealizationList();
    }

    onPageChange(event: { page: number; pageSize: number }): void {
        this.currentPage = event.page;
        this.pageSize = event.pageSize;
        this.loadFundRealizationList();
    }

    clearFilters(): void {
        this.searchTerm = '';
        this.selectedDate = this.today();
        this.currentPage = 1;
        this.loadFundRealizationList();
    }

    formatAmount(val: number): string {
        return val.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    onProcessRealization(): void {
        const selected = this.selectedBranches;
        if (selected.length === 0) return;
        console.log('Process Realization for:', selected.map(b => b.branchCode));
    }
}
