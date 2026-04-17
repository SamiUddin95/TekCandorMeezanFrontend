import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReturnListItem, ReturnMarkingUtilityService } from '../../services/return-marking-utility.service';

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
    imports: [CommonModule, FormsModule],
    templateUrl: './return-marking-utility-list.component.html',
    styleUrl: './return-marking-utility-list.component.scss'
})
export class ReturnMarkingUtilityListComponent implements OnInit {

    searchTerm = '';
    filterStatus = '';
    isLoading = false;
    loadError = '';

    rows: ReturnMarkingListItem[] = [];

    constructor(
        private returnMarkingUtilityService: ReturnMarkingUtilityService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadReturnList();
    }

    private loadReturnList(): void {
        this.isLoading = true;
        this.loadError = '';

        this.returnMarkingUtilityService.getReturnList().subscribe({
            next: (response) => {
                this.isLoading = false;
                const items = response?.data?.items || [];
                this.rows = items.map((item) => this.mapToRow(item));
            },
            error: () => {
                this.isLoading = false;
                this.rows = [];
                this.loadError = 'Unable to load return marking records.';
            }
        });
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

    onEdit(item: ReturnMarkingListItem): void {
        this.router.navigate(['/pages/outward-clearing/return-marking-utility', item.id]);
    }

    formatAmount(val: number): string {
        return val.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
}
