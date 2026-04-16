import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationalOverviewService, ChequeDetailItem } from '../../../services/operational-overview.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-oo-detail',
    imports: [CommonModule],
    templateUrl: './operational-overview-detail.component.html',
    styleUrl: './operational-overview-detail.component.scss'
})
export class OperationalOverviewDetailComponent implements OnInit, OnChanges {

    @Input() chequeId!: number;
    @Output() backClicked = new EventEmitter<void>();

    isLoading = false;
    isActionLoading = false;
    loadError = '';
    detailItem: ChequeDetailItem | null = null;

    constructor(private service: OperationalOverviewService) { }

    ngOnInit(): void {
        this.loadDetail();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['chequeId'] && !changes['chequeId'].firstChange) {
            this.loadDetail();
        }
    }

    private loadDetail(): void {
        if (!this.chequeId) return;
        this.isLoading = true;
        this.loadError = '';
        this.detailItem = null;
        this.service.getById(this.chequeId).subscribe({
            next: (response) => {
                this.isLoading = false;
                this.detailItem = response?.data || null;
            },
            error: () => {
                this.isLoading = false;
                this.loadError = 'Unable to load transaction details.';
            }
        });
    }

    onBack(): void {
        this.backClicked.emit();
    }

    onSendBack(): void {
        console.log('Send Back:', this.detailItem?.chequeNo || this.chequeId);
    }

    onRejectInstrument(): void {
        if (this.isActionLoading) return;

        const id = this.detailItem?.id || this.chequeId;
        if (!id) return;

        this.isActionLoading = true;
        this.service.rejectCheque(id).subscribe({
            next: (response) => {
                this.isActionLoading = false;
                Swal.fire({
                    icon: 'success',
                    title: 'Rejected',
                    text: response?.data || 'Cheque rejected successfully',
                    timer: 1800,
                    showConfirmButton: false
                });
                this.onBack();
            },
            error: () => {
                this.isActionLoading = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Rejection Failed',
                    text: 'Unable to reject cheque.'
                });
            }
        });
    }

    onApproveInstrument(): void {
        if (this.isActionLoading) return;

        const id = this.detailItem?.id || this.chequeId;
        if (!id) return;

        this.isActionLoading = true;
        this.service.approveCheque(id).subscribe({
            next: (response) => {
                this.isActionLoading = false;
                Swal.fire({
                    icon: 'success',
                    title: 'Approved',
                    text: response?.data || 'Cheque approved successfully',
                    timer: 1800,
                    showConfirmButton: false
                });
                this.onBack();
            },
            error: () => {
                this.isActionLoading = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Approval Failed',
                    text: 'Unable to approve cheque.'
                });
            }
        });
    }

    formatAmount(val: number): string {
        return (val || 0).toLocaleString('en-PK');
    }

    formatDate(dateStr: string | null | undefined): string {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return '—';
        return d.toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    }

    mapStatus(status: string): string {
        const map: Record<string, string> = {
            'P': 'Pending', 'RE': 'Returned', 'C': 'Cleared',
            'H': 'Priority', 'PR': 'Priority', 'CR': 'Critical'
        };
        return map[(status || '').toUpperCase()] || status || '—';
    }
}
