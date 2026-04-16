import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

    branches: BranchRealizationItem[] = [
        { id: 1, branchCode: 'BR-0012', branchName: 'Main Commercial Branch',      totalAmount: 1450250.00, instrumentCount: 42, status: 'Ready', selected: false },
        { id: 2, branchCode: 'BR-0045', branchName: 'Industrial Zone Annex',        totalAmount: 890400.50,  instrumentCount: 18, status: 'Ready', selected: false },
        { id: 3, branchCode: 'BR-0089', branchName: 'Regional Corporate Office',    totalAmount: 2105600.00, instrumentCount: 64, status: 'Ready', selected: false },
        { id: 4, branchCode: 'BR-0112', branchName: 'Downtown Retail Hub',          totalAmount: 450200.75,  instrumentCount: 22, status: 'Ready', selected: false },
        { id: 5, branchCode: 'BR-0156', branchName: 'East Port Logistics Branch',   totalAmount: 1200000.00, instrumentCount: 35, status: 'Ready', selected: false },
        { id: 6, branchCode: 'BR-0201', branchName: 'Central Tech Park Branch',     totalAmount: 730000.25,  instrumentCount: 12, status: 'Ready', selected: false },
        { id: 7, branchCode: 'BR-0234', branchName: 'West Gate Financial Tower',    totalAmount: 3400000.50, instrumentCount: 88, status: 'Ready', selected: false },
        { id: 8, branchCode: 'BR-0278', branchName: 'North City Commerce Center',   totalAmount: 560000.00,  instrumentCount: 20, status: 'Ready', selected: false },
        { id: 9, branchCode: 'BR-0301', branchName: 'South Bridge Trade Hub',       totalAmount: 980000.00,  instrumentCount: 31, status: 'Ready', selected: false },
    ];

    ngOnInit(): void {
        this.selectedDate = this.today();
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
        return Math.ceil(this.filtered.length / this.pageSize);
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
