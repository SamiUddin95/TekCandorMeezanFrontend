import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ChequeInfoItem, ChequeInfoService } from '../../../services/cheque-info.service';

export interface ChequeLodgmentItem {
    id: number;
    depositorName: string;
    accountNumber: string;
    beneficiaryName: string;
    amount: number;
    currency: string;
    status: string;
    date: string;
    trackingNumber: string;
}

@Component({
    selector: 'app-cheque-lodgment-list',
    imports: [CommonModule, FormsModule],
    templateUrl: './cheque-lodgment-list.component.html',
    styleUrl: './cheque-lodgment-list.component.scss'
})
export class ChequeLodgmentListComponent implements OnInit {

    searchTerm = '';
    filterStatus = '';
    isLoading = false;
    lodgments: ChequeLodgmentItem[] = [];

    constructor(
        private router: Router,
        private chequeInfoService: ChequeInfoService
    ) {}

    ngOnInit(): void {
        this.loadChequeLodgments();
    }

    private mapStatus(status: string): string {
        if (!status) return 'Draft';
        const normalized = status.toUpperCase();
        if (normalized === 'P') return 'Pending Review';
        if (normalized === 'C') return 'Cleared';
        if (normalized === 'S') return 'Scanning';
        if (normalized === 'RE') return 'Reject';
        if (normalized === 'A') return 'Approved';

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
            trackingNumber: item.referenceNo || `REF-${item.id}`
        };
    }

    loadChequeLodgments(): void {
        this.isLoading = true;
        this.chequeInfoService.getChequeInfos().subscribe({
            next: (response) => {
                this.isLoading = false;
                this.lodgments = (response?.data?.items || []).map((item) => this.mapToListItem(item));
            },
            error: () => {
                this.isLoading = false;
                this.lodgments = [];
                Swal.fire({
                    icon: 'error',
                    title: 'Load Failed',
                    text: 'Unable to load cheque lodgment records.',
                    confirmButtonColor: '#5a2181'
                });
            }
        });
    }

    get filteredData(): ChequeLodgmentItem[] {
        return this.lodgments.filter(item => {
            const matchSearch = !this.searchTerm ||
                item.depositorName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                item.accountNumber.includes(this.searchTerm) ||
                item.trackingNumber.toLowerCase().includes(this.searchTerm.toLowerCase());
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
}
