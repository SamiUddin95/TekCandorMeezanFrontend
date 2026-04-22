import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ChequeInfoItem, ChequeInfoService } from '../../../services/cheque-info.service';
import { PaginationComponent } from '@app/components/pagination/pagination.component';

export interface ChequeLodgmentItem {
    id: number;
    depositorName: string;
    accountNumber: string;
    beneficiaryName: string;
    amount: number;
    currency: string;
    status: string;
    date: string;
    chequeNo: string;
}

@Component({
    selector: 'app-cheque-lodgment-list',
    imports: [CommonModule, FormsModule, PaginationComponent],
    templateUrl: './cheque-lodgment-list.component.html',
    styleUrl: './cheque-lodgment-list.component.scss'
})
export class ChequeLodgmentListComponent implements OnInit {

    searchTerm = '';
    filterStatus = '';
    selectedDate = '';
    currentPage = 1;
    pageSize = 10;
    totalRecords = 0;
    isLoading = false;
    lodgments: ChequeLodgmentItem[] = [];

    constructor(
        private router: Router,
        private chequeInfoService: ChequeInfoService
    ) {}

    ngOnInit(): void {
        this.selectedDate = this.today();
        this.loadChequeLodgments();
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

    private mapStatus(status: string): string {
        if (!status) return 'Draft';
        const normalized = status.toUpperCase();
        if (normalized === 'P') return 'Pending';
        if (normalized === 'C') return 'Cleared';
        if (normalized === 'RE') return 'Reject';
        if (normalized === 'A') return 'Approved';
        if (normalized === 'U') return 'Un-Authorized';

        return status;
    }

    private mapToListItem(item: ChequeInfoItem): ChequeLodgmentItem {
        return {
            id: item.id,
            depositorName: item.depositorTitle || '—',
            accountNumber: item.accountNo || '—',
            beneficiaryName: item.beneficiaryTitle || '—',
            amount: item.amount || 0,
            currency: item.currency || 'PKR',
            status: this.mapStatus(item.status),
            date: item.date ? item.date.split('T')[0] : '—',
            chequeNo: item.chequeNo
        };
    }

    loadChequeLodgments(): void {
        this.isLoading = true;
        this.chequeInfoService.getChequeInfos(
            this.currentPage,
            this.pageSize,
            this.selectedDate,
            this.getNextDate(this.selectedDate)
        ).subscribe({
            next: (response) => {
                this.isLoading = false;
                this.lodgments = (response?.data?.items || []).map((item) => this.mapToListItem(item));
                this.totalRecords = response?.data?.totalCount || 0;
            },
            error: () => {
                this.isLoading = false;
                this.lodgments = [];
                this.totalRecords = 0;
                Swal.fire({
                    icon: 'error',
                    title: 'Load Failed',
                    text: 'Unable to load cheque lodgment records.',
                    confirmButtonColor: '#5a2181'
                });
            }
        });
    }

    onFilterChange(): void {
        this.currentPage = 1;
    }

    onSearch(): void {
        this.currentPage = 1;
        this.loadChequeLodgments();
    }

    onPageChange(event: { page: number; pageSize: number }): void {
        this.currentPage = event.page;
        this.pageSize = event.pageSize;
        this.loadChequeLodgments();
    }

    clearFilters(): void {
        this.searchTerm = '';
        this.filterStatus = '';
        this.selectedDate = this.today();
        this.currentPage = 1;
        this.loadChequeLodgments();
    }

    get filteredData(): ChequeLodgmentItem[] {
        return this.lodgments.filter(item => {
            const matchSearch = !this.searchTerm ||
                item.depositorName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                item.accountNumber.includes(this.searchTerm) ||
                item.chequeNo.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchStatus = !this.filterStatus || item.status === this.filterStatus;
            return matchSearch && matchStatus;
        });
    }

    // getStatusClass(status: string): string {
    //     switch (status) {
    //         case 'Completed': return 'bg-success';
    //         case 'Pending Review': return 'bg-warning text-dark';
    //         case 'Scanning': return 'bg-info text-dark';
    //         case 'Draft': return 'bg-secondary';
    //         default: return '';
    //     }
    // }

    formatAmount(amount: number): string {
        return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    onAddNew(): void {
        this.router.navigate(['/pages/outward-clearing/cheque-lodgment/new']);
    }

    onView(item: ChequeLodgmentItem): void {
        this.router.navigate(['/pages/outward-clearing/cheque-lodgment/review', item.id]);
    }

    onDepositSlip(item: ChequeLodgmentItem): void {
        this.router.navigate(['/pages/outward-clearing/cheque-lodgment/deposit-slip', item.id]);
    }
}
