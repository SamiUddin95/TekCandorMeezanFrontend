import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ChequeInfoItem, ChequeInfoListResponse, ChequeInfoService } from '../../services/cheque-info.service';
import { PaginationComponent } from '@app/components/pagination/pagination.component';

export interface TransactionHistoryItem {
    id: number;
    date: string;
    chequeNo: string;
    depositorTitle: string;
    accountNo: string;
    beneficiaryTitle: string;
    amount: number;
    currency: string;
    drawerBank: string;
    referenceNo: string;
    instrumentType: string;
    status: string;
    rawStatus: string;
}

@Component({
    selector: 'app-transaction-history',
    standalone: true,
    imports: [CommonModule, FormsModule, PaginationComponent],
    templateUrl: './transaction-history.component.html',
    styleUrl: './transaction-history.component.scss'
})
export class TransactionHistoryComponent implements OnInit {

    searchTerm = '';
    filterStatus = '';
    selectedDate = '';
    currentPage = 1;
    pageSize = 10;
    totalRecords = 0;
    isLoading = false;
    transactions: TransactionHistoryItem[] = [];

    constructor(private chequeInfoService: ChequeInfoService) {}

    ngOnInit(): void {
        this.selectedDate = this.today();
        this.loadTransactions();
    }

    private today(): string {
        return new Date().toISOString().split('T')[0];
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

    private mapStatus(status: string): string {
        if (!status) return 'Draft';
        const s = status.toUpperCase();
        if (s === 'P') return 'Pending Review';
        if (s === 'C') return 'Cleared';
        if (s === 'S') return 'Scanning';
        if (s === 'RE') return 'Reject';
        if (s === 'A') return 'Approved';
        if (s === 'U') return 'Un-Authorized';
        return status;
    }

    loadTransactions(): void {
        this.isLoading = true;
        this.chequeInfoService.getTransactionHistory(
            this.currentPage,
            this.pageSize,
            this.selectedDate,
            this.getNextDate(this.selectedDate)
        ).subscribe({
            next: (response: ChequeInfoListResponse) => {
                this.isLoading = false;
                const items = response?.data?.items || [];
                this.transactions = items.map((item: ChequeInfoItem) => ({
                    id: item.id,
                    date: item.date ? item.date.split('T')[0] : '—',
                    chequeNo: item.chequeNo || '—',
                    depositorTitle: item.depositorTitle || '—',
                    accountNo: item.accountNo || '—',
                    beneficiaryTitle: item.beneficiaryTitle || '—',
                    amount: item.amount || 0,
                    currency: item.currency || 'PKR',
                    drawerBank: item.drawerBank || '—',
                    referenceNo: item.referenceNo || '—',
                    instrumentType: item.instrumentType || '—',
                    status: this.mapStatus(item.status),
                    rawStatus: item.status || ''
                }));
                this.totalRecords = response?.data?.totalCount || 0;
            },
            error: () => {
                this.isLoading = false;
                this.transactions = [];
                this.totalRecords = 0;
                Swal.fire({
                    icon: 'error',
                    title: 'Load Failed',
                    text: 'Unable to load transaction history.',
                    confirmButtonColor: '#5a2181'
                });
            }
        });
    }

    onSearch(): void {
        this.currentPage = 1;
        this.loadTransactions();
    }

    onPageChange(event: { page: number; pageSize: number }): void {
        this.currentPage = event.page;
        this.pageSize = event.pageSize;
        this.loadTransactions();
    }

    clearFilters(): void {
        this.searchTerm = '';
        this.filterStatus = '';
        this.selectedDate = this.today();
        this.currentPage = 1;
        this.loadTransactions();
    }

    get filteredData(): TransactionHistoryItem[] {
        const q = this.searchTerm.toLowerCase();
        return this.transactions.filter(item => {
            const matchSearch = !q ||
                item.chequeNo.toLowerCase().includes(q) ||
                item.depositorTitle.toLowerCase().includes(q) ||
                item.accountNo.toLowerCase().includes(q) ||
                item.referenceNo.toLowerCase().includes(q);
            const matchStatus = !this.filterStatus || item.status === this.filterStatus;
            return matchSearch && matchStatus;
        });
    }

    formatAmount(amount: number): string {
        return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'Approved': return 'badge bg-success';
            case 'Pending Review': return 'badge bg-warning text-dark';
            case 'Scanning': return 'badge bg-info text-dark';
            case 'Cleared': return 'badge bg-primary';
            case 'Reject': return 'badge bg-danger';
            default: return 'badge bg-secondary';
        }
    }
}
