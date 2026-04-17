import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FundRealizationItem, FundRealizationService } from '../../services/fund-realization.service';

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
    imports: [CommonModule, FormsModule],
    templateUrl: './fund-realization.component.html',
    styleUrl: './fund-realization.component.scss'
})
export class FundRealizationComponent implements OnInit {

    searchTerm = '';
    selectedDate = '';
    currentPage = 1;
    pageSize = 7;
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

        this.fundRealizationService.getFundRealizationList().subscribe({
            next: (response) => {
                this.isLoading = false;
                const items = response?.data?.items ?? [];
                this.branches = items.map((item, index) => this.mapToBranch(item, index));
                this.currentPage = 1;
            },
            error: () => {
                this.isLoading = false;
                this.branches = [];
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

    get filtered(): BranchRealizationItem[] {
        const q = this.searchTerm.trim().toLowerCase();
        if (!q) return this.branches;
        return this.branches.filter(b =>
            b.branchCode.toLowerCase().includes(q) ||
            b.branchName.toLowerCase().includes(q)
        );
    }

    get totalPages(): number {
        return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
    }

    get pagedBranches(): BranchRealizationItem[] {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.filtered.slice(start, start + this.pageSize);
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

    onSearch(): void {
        this.currentPage = 1;
    }

    prevPage(): void {
        if (this.currentPage > 1) this.currentPage--;
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) this.currentPage++;
    }

    minVal(a: number, b: number): number {
        return Math.min(a, b);
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
