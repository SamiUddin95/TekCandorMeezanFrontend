import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface BatchItem {
    batchId: string;
    branch: string;
    createdBy: string;
    instruments: number;
    totalAmount: number;
    status: 'Authorized' | 'Balanced' | 'Draft' | 'Rejected';
    createdDate: string;
}

@Component({
    selector: 'app-batch-management-list',
    imports: [CommonModule, FormsModule],
    templateUrl: './batch-management-list.component.html',
    styleUrl: './batch-management-list.component.scss'
})
export class BatchManagementListComponent {

    searchQuery = '';
    fromDate = '2024-06-01';
    toDate = '2024-06-20';
    selectedBranch = '';
    selectedStatus = '';
    currentPage = 1;
    pageSize = 5;

    stats = {
        totalBatches: 24,
        pendingAuth: 8,
        authorizedValue: 18400000,
        processingExceptions: 2
    };

    batches: BatchItem[] = [
        {
            batchId: 'B-10293',
            branch: 'Head Office - 001',
            createdBy: 'John Operations',
            instruments: 12,
            totalAmount: 2450000,
            status: 'Authorized',
            createdDate: '2024-05-20 09:43'
        },
        {
            batchId: 'B-10294',
            branch: 'Main Street - 005',
            createdBy: 'Sarah Jenkins',
            instruments: 45,
            totalAmount: 12100500,
            status: 'Balanced',
            createdDate: '2024-05-20 11:28'
        },
        {
            batchId: 'B-10295',
            branch: 'Industrial Area - 012',
            createdBy: 'John Operations',
            instruments: 8,
            totalAmount: 450000,
            status: 'Draft',
            createdDate: '2024-05-25 14:18'
        },
        {
            batchId: 'B-10296',
            branch: 'Head Office - 001',
            createdBy: 'Michael Chen',
            instruments: 32,
            totalAmount: 5670000,
            status: 'Balanced',
            createdDate: '2024-05-26 15:38'
        },
        {
            batchId: 'B-10297',
            branch: 'Suburban Branch - 009',
            createdBy: 'Sarah Jenkins',
            instruments: 19,
            totalAmount: 1200000,
            status: 'Rejected',
            createdDate: '2024-05-18 16:45'
        }
    ];

    constructor(private router: Router) {}

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
        this.router.navigate(['/pages/outward-clearing/batch-management/new']);
    }

    onRefresh(): void {
        this.searchQuery = '';
        this.selectedStatus = '';
        this.currentPage = 1;
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
