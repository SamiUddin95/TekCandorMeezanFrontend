import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperationalOverviewService, SupervisorListItem } from '../../services/operational-overview.service';
import { OperationalOverviewDetailComponent } from './operational-overview-detail/operational-overview-detail.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
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
    imports: [CommonModule, FormsModule, OperationalOverviewDetailComponent, PaginationComponent],
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
    fromDate = '';
    isLoading = false;
    loadError = '';

    showDetail = false;
    selectedId: number | null = null;
    actionInProgressId: number | null = null;
    bulkActionInProgress = false;

    selectedIds = new Set<number>();

    totalRecords = 0;
    totalPages = 1;

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


    ngOnInit(): void {
        // Set current date as default for selected date filter
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        this.fromDate = formattedDate;

        this.loadSupervisorList();
    }

    private loadSupervisorList(): void {
        this.isLoading = true;
        this.loadError = '';
        this.selectedIds.clear();
        this.operationalOverviewService.getSupervisorList(
            this.currentPage,
            this.pageSize,
            this.fromDate,
            this.getNextDate(this.fromDate)
        ).subscribe({
            next: (response) => {
                this.isLoading = false;
                this.transactions = (response?.data?.items || []).map((item) => this.mapToTransaction(item));
                // Server-side pagination values
                this.totalRecords = response?.data?.totalCount || 0;
                this.totalPages = Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
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

    onSearch(): void {
        this.currentPage = 1;
        this.loadSupervisorList();
    }

    onPageChange(event: { page: number; pageSize: number }): void {
        this.currentPage = event.page;
        this.pageSize = event.pageSize;
        this.loadSupervisorList();
    }

    clearFilters(): void {
        this.searchTerm = '';
        this.selectedBranch = 'all';
        this.selectedStatus = 'all';
        // Reset date to current date
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        this.fromDate = formattedDate;
        this.currentPage = 1;
        this.loadSupervisorList();
    }

    formatAmount(val: number): string {
        return val.toLocaleString('en-PK');
    }

    // ── Selection ──
    toggleSelect(id: number): void {
        if (this.selectedIds.has(id)) {
            this.selectedIds.delete(id);
        } else {
            this.selectedIds.add(id);
        }
    }

    toggleSelectAll(): void {
        if (this.isAllSelected) {
            this.filteredTransactions.forEach(t => this.selectedIds.delete(t.id));
        } else {
            this.filteredTransactions.forEach(t => this.selectedIds.add(t.id));
        }
    }

    get isAllSelected(): boolean {
        return this.filteredTransactions.length > 0 &&
            this.filteredTransactions.every(t => this.selectedIds.has(t.id));
    }

    get selectedCount(): number {
        return this.selectedIds.size;
    }

    // ── Bulk Approve ──
    onBulkApprove(): void {
        const ids = Array.from(this.selectedIds);
        if (ids.length === 0) {
            Swal.fire({ icon: 'warning', title: 'No Selection', text: 'Please select at least one cheque to approve.' });
            return;
        }

        Swal.fire({
            title: 'Bulk Approve',
            text: `Are you sure you want to approve ${ids.length} cheque(s)?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Approve All',
            confirmButtonColor: '#198754'
        }).then((result) => {
            if (!result.isConfirmed) return;

            this.bulkActionInProgress = true;
            this.operationalOverviewService.bulkSupervisorApprove(ids).subscribe({
                next: (response) => {
                    this.bulkActionInProgress = false;
                    this.selectedIds.clear();
                    const d = response.data;
                    Swal.fire({
                        icon: d.failedCount > 0 ? 'warning' : 'success',
                        title: 'Bulk Approve Result',
                        html: `<b>${d.successCount}</b> of <b>${d.totalRequested}</b> approved successfully.` +
                            (d.failedCount > 0 ? `<br><b>${d.failedCount}</b> failed (IDs: ${d.failedIds.join(', ')})` : ''),
                        timer: d.failedCount > 0 ? undefined : 2500,
                        showConfirmButton: d.failedCount > 0
                    });
                    this.loadSupervisorList();
                },
                error: () => {
                    this.bulkActionInProgress = false;
                    Swal.fire({ icon: 'error', title: 'Bulk Approve Failed', text: 'Unable to perform bulk approval. Please try again.' });
                }
            });
        });
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
