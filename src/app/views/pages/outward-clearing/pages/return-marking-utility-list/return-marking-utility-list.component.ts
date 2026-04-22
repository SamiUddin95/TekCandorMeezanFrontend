import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReturnListItem, ReturnMarkingUtilityService } from '../../services/return-marking-utility.service';
import { PaginationComponent } from '@app/components/pagination/pagination.component';

interface ReturnMarkingListItem {
    id: number;
    chequeNo: string;
    depositor: string;
    accountNo: string;
    branchName: string;
    amount: number;
    status: string;
    returnCode: string;
    returnReason: string;
    date: string;
}

@Component({
    selector: 'app-return-marking-utility-list',
    imports: [CommonModule, FormsModule, PaginationComponent],
    templateUrl: './return-marking-utility-list.component.html',
    styleUrl: './return-marking-utility-list.component.scss'
})
export class ReturnMarkingUtilityListComponent implements OnInit {

    searchTerm = '';
    filterStatus = '';
    selectedDate = '';
    currentPage = 1;
    pageSize = 10;
    totalRecords = 0;
    isLoading = false;
    loadError = '';

    rows: ReturnMarkingListItem[] = [];

    constructor(
        private returnMarkingUtilityService: ReturnMarkingUtilityService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.selectedDate = this.today();
        this.loadReturnList();
    }

    private loadReturnList(): void {
        this.isLoading = true;
        this.loadError = '';

        this.returnMarkingUtilityService.getReturnList(
            this.currentPage,
            this.pageSize,
            this.selectedDate,
            this.getNextDate(this.selectedDate)
        ).subscribe({
            next: (response) => {
                this.isLoading = false;
                const items = response?.data?.items || [];
                this.rows = items.map((item) => this.mapToRow(item));
                this.totalRecords = response?.data?.totalCount || 0;
            },
            error: () => {
                this.isLoading = false;
                this.rows = [];
                this.totalRecords = 0;
                this.loadError = 'Unable to load return marking records.';
            }
        });
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

    private mapToRow(item: ReturnListItem): ReturnMarkingListItem {
        return {
            id: item.chequeInfoId,
            chequeNo: item.chequeNo || '—',
            depositor: item.depositorTitle || '—',
            accountNo: item.accountNo || '—',
            branchName: item.branchName || '—',
            amount: item.amount || 0,
            status: item.status || '—',
            returnCode: item.returnCode || '—',
            returnReason: item.returnReason || '—',
            date: this.formatDate(item.date)
        };
    }

    private formatDate(dateTime: string): string {
        if (!dateTime) return '—';
        const d = new Date(dateTime);
        if (Number.isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('en-GB');
    }

    get filteredRows(): ReturnMarkingListItem[] {
        const q = this.searchTerm.trim().toLowerCase();

        return this.rows.filter((row) => {
            const matchesSearch = !q
                || row.chequeNo.toLowerCase().includes(q)
                || row.depositor.toLowerCase().includes(q)
                || row.accountNo.toLowerCase().includes(q)
                || row.returnReason.toLowerCase().includes(q);

            const matchesStatus = !this.filterStatus || row.status === this.filterStatus;

            return matchesSearch && matchesStatus;
        });
    }

    get statusOptions(): string[] {
        return Array.from(new Set(this.rows.map((r) => r.status).filter(Boolean)));
    }

    onFilterChange(): void {
        this.currentPage = 1;
    }

    onSearch(): void {
        this.currentPage = 1;
        this.loadReturnList();
    }

    onPageChange(event: { page: number; pageSize: number }): void {
        this.currentPage = event.page;
        this.pageSize = event.pageSize;
        this.loadReturnList();
    }

    clearFilters(): void {
        this.searchTerm = '';
        this.filterStatus = '';
        this.selectedDate = this.today();
        this.currentPage = 1;
        this.loadReturnList();
    }

    onEdit(item: ReturnMarkingListItem): void {
        this.router.navigate(['/pages/outward-clearing/return-marking-utility', item.id]);
    }

    formatAmount(val: number): string {
        return val.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
}
