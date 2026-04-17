import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperationalOverviewService, SupervisorListItem } from '../../services/operational-overview.service';
import { OperationalOverviewDetailComponent } from './operational-overview-detail/operational-overview-detail.component';
import Swal from 'sweetalert2';

interface Transaction {
    id: number;
    chequeNo: string;
    txnId: string;
    payeeName: string;
    amount: number;
    branchName: string;
    timeReceived: string;
    status: 'Pending' | 'Priority' | 'Critical';
}

@Component({
    selector: 'app-operational-overview',
    imports: [CommonModule, FormsModule, OperationalOverviewDetailComponent],
    templateUrl: './operational-overview.component.html',
    styleUrl: './operational-overview.component.scss'
})
export class OperationalOverviewComponent implements OnInit {

    activeTab: 'all' | 'highValue' | 'regular' = 'all';
    currentPage = 1;
    pageSize = 6;
    searchTerm = '';
    selectedBranch = 'all';
    selectedStatus: 'all' | 'Pending' | 'Priority' | 'Critical' = 'all';
    isLoading = false;
    loadError = '';

    showDetail = false;
    selectedId: number | null = null;
    actionInProgressId: number | null = null;

    transactions: Transaction[] = [];

    constructor(private operationalOverviewService: OperationalOverviewService) { }

    get branchOptions(): string[] {
        return ['all', ...new Set(this.transactions.map(t => t.branchName))];
    }

    get filteredTransactions(): Transaction[] {
        let result = [...this.transactions];

        if (this.activeTab === 'highValue') {
            result = result.filter(t => t.amount >= 500000);
        } else if (this.activeTab === 'regular') {
            result = result.filter(t => t.amount < 500000);
        }

        const query = this.searchTerm.trim().toLowerCase();
        if (query) {
            result = result.filter(t =>
                t.chequeNo.toLowerCase().includes(query)
                || t.payeeName.toLowerCase().includes(query)
                || t.txnId.toLowerCase().includes(query)
            );
        }

        if (this.selectedBranch !== 'all') {
            result = result.filter(t => t.branchName === this.selectedBranch);
        }

        if (this.selectedStatus !== 'all') {
            result = result.filter(t => t.status === this.selectedStatus);
        }

        return result;
    }

    get paginatedTransactions(): Transaction[] {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.filteredTransactions.slice(start, end);
    }

    get totalRecords(): number {
        return this.filteredTransactions.length;
    }

    get totalPages(): number {
        return Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
    }

    get visiblePages(): (number | string)[] {
        const pages: (number | string)[] = [];
        const total = this.totalPages;
        if (total <= 5) {
            for (let i = 1; i <= total; i++) pages.push(i);
        } else {
            pages.push(1, 2, 3, '...', total);
        }
        return pages;
    }

    ngOnInit(): void {
        this.loadSupervisorList();
    }

    private loadSupervisorList(): void {
        this.isLoading = true;
        this.loadError = '';
        this.operationalOverviewService.getSupervisorList().subscribe({
            next: (response) => {
                this.isLoading = false;
                this.transactions = (response?.data?.items || []).map((item) => this.mapToTransaction(item));
                this.currentPage = 1;
            },
            error: () => {
                this.isLoading = false;
                this.transactions = [];
                this.loadError = 'Unable to load operational overview records.';
            }
        });
    }

    private mapToTransaction(item: SupervisorListItem): Transaction {
        return {
            id: item.id,
            chequeNo: item.chequeNo || '—',
            txnId: item.referenceNo || `TXN-${item.id}`,
            payeeName: item.beneficiaryTitle || item.depositorTitle || '—',
            amount: item.amount || 0,
            branchName: item.branchName || `Branch ${item.receiverBranchCode || '—'}`,
            timeReceived: this.formatTime(item.date || item.createdOn),
            status: this.mapStatus(item.status)
        };
    }

    private mapStatus(status: string): 'Pending' | 'Priority' | 'Critical' {
        const value = (status || '').trim().toUpperCase();
        if (value === 'C' || value === 'CRITICAL') {
            return 'Critical';
        }
        if (value === 'H' || value === 'PR' || value === 'PRIORITY') {
            return 'Priority';
        }
        return 'Pending';
    }

   private formatTime(dateTime: string): string {
    if (!dateTime) return '—';

    const d = new Date(dateTime);
    if (Number.isNaN(d.getTime())) return '—';

    return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',   
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true     
    });
}

    setTab(tab: 'all' | 'highValue' | 'regular'): void {
        this.activeTab = tab;
        this.currentPage = 1;
    }

    onFilterChange(): void {
        this.currentPage = 1;
    }

    clearFilters(): void {
        this.searchTerm = '';
        this.selectedBranch = 'all';
        this.selectedStatus = 'all';
        this.currentPage = 1;
    }

    goToPage(page: number | string): void {
        if (typeof page === 'number') {
            this.currentPage = page;
        }
    }

    prevPage(): void {
        if (this.currentPage > 1) this.currentPage--;
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) this.currentPage++;
    }

    formatAmount(val: number): string {
        return val.toLocaleString('en-PK');
    }

    onView(txn: Transaction): void {
        this.selectedId = txn.id;
        this.showDetail = true;
    }

    backToList(): void {
        this.showDetail = false;
        this.selectedId = null;
    }

    onApprove(txn: Transaction): void {
        if (this.actionInProgressId !== null) return;

        this.actionInProgressId = txn.id;
        this.operationalOverviewService.approveCheque(txn.id).subscribe({
            next: (response) => {
                this.actionInProgressId = null;
                Swal.fire({
                    icon: 'success',
                    title: 'Approved',
                    text: response?.data || `Cheque ${txn.chequeNo} approved successfully`,
                    timer: 1800,
                    showConfirmButton: false
                });
                this.loadSupervisorList();
            },
            error: () => {
                this.actionInProgressId = null;
                Swal.fire({
                    icon: 'error',
                    title: 'Approval Failed',
                    text: `Unable to approve cheque ${txn.chequeNo}`
                });
            }
        });
    }

    async onReject(txn: Transaction): Promise<void> {
        if (this.actionInProgressId !== null) return;

        const { isConfirmed, value } = await Swal.fire({
            title: 'Reject Cheque',
            text: 'You can add an optional rejection reason.',
            input: 'textarea',
            inputLabel: 'Reason (Optional)',
            inputPlaceholder: 'Type reason here (optional)...',
            inputAttributes: {
                maxlength: '300'
            },
            showCancelButton: true,
            confirmButtonText: 'Reject',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc2626'
        });

        if (!isConfirmed) return;

        const remarks = typeof value === 'string' ? value.trim() : '';

        this.actionInProgressId = txn.id;
        this.operationalOverviewService.rejectCheque(txn.id, remarks).subscribe({
            next: (response) => {
                this.actionInProgressId = null;
                Swal.fire({
                    icon: 'success',
                    title: 'Rejected',
                    text: response?.data || `Cheque ${txn.chequeNo} rejected successfully`,
                    timer: 1800,
                    showConfirmButton: false
                });
                this.loadSupervisorList();
            },
            error: () => {
                this.actionInProgressId = null;
                Swal.fire({
                    icon: 'error',
                    title: 'Rejection Failed',
                    text: `Unable to reject cheque ${txn.chequeNo}`
                });
            }
        });
    }
}
