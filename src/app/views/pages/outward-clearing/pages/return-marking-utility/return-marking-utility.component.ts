import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReturnDetailData, ReturnMarkingUtilityService } from '../../services/return-marking-utility.service';
import Swal from 'sweetalert2';

export interface SessionHistoryItem {
    time: string;
    chequeNo: string;
    amount: number;
    returnReason: string;
    status: 'Marked' | 'Pending' | 'On Hold';
}

export interface InstrumentMetadata {
    beneficiaryTitle: string;
    chequeNo: string;
    accountNumber: string;
    chequeDate: string;
    branchName: string;
    returnReason: string;
    settlementAmount: number;
    imageF: string;
    imageB: string;
    imageU: string;
}

@Component({
    selector: 'app-return-marking-utility',
    imports: [CommonModule, FormsModule],
    templateUrl: './return-marking-utility.component.html',
    styleUrl: './return-marking-utility.component.scss'
})
export class ReturnMarkingUtilityComponent implements OnInit {

    instrumentNumber = '77452168';
    chequeInfoId: number | null = null;
    isSearching = false;
    instrumentFound = true;
    isLoading = false;
    isSubmitting = false;

    selectedReasonCode = 'SBP-01';
    officerRemarks = '';
    isInternal = false;

    reasonCodes = [
        { code: 'SBP-01', label: 'Insufficient Funds' },
        { code: 'SBP-02', label: 'Account Closed' },
        { code: 'SBP-03', label: 'Payment Stopped' },
        { code: 'SBP-04', label: 'Post Dated' },
        { code: 'SBP-05', label: 'Signature Mismatch' },
        { code: 'SBP-06', label: 'Instruments Altered' },
        { code: 'SBP-07', label: 'Refer to Drawer' },
        { code: 'SBP-08', label: 'Amount in Words & Figures Differ' },
    ];

    instrument: InstrumentMetadata = {
        beneficiaryTitle: '—',
        chequeNo: '—',
        accountNumber: '—',
        chequeDate: '—',
        branchName: '—',
        returnReason: '—',
        settlementAmount: 0,
        imageF: '',
        imageB: '',
        imageU: ''
    };

    sessionHistory: SessionHistoryItem[] = [
        { time: '10:45 AM', chequeNo: '90012031', amount: 45000.00,  returnReason: 'Insufficient Funds', status: 'Marked' },
        { time: '11:02 AM', chequeNo: '90012038', amount: 125300.00, returnReason: 'Post Dated',         status: 'Marked' },
        { time: '11:30 AM', chequeNo: '90012045', amount: 8200.00,   returnReason: 'Signature Mismatch', status: 'Marked' },
        { time: '11:45 AM', chequeNo: '90012048', amount: 15000.00,  returnReason: 'Instruments Altered', status: 'Marked' },
        { time: '12:05 PM', chequeNo: '90012055', amount: 250000.00, returnReason: 'Insufficient Funds', status: 'Marked' },
    ];

    sessionId = 'SHK-8';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private returnMarkingUtilityService: ReturnMarkingUtilityService
    ) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe((params) => {
            const idParam = params.get('id');
            const id = idParam ? Number(idParam) : NaN;

            if (!Number.isNaN(id) && id > 0) {
                this.loadReturnDetail(id);
            }
        });
    }

    private loadReturnDetail(id: number): void {
        this.chequeInfoId = id;
        this.isLoading = true;
        this.instrumentFound = false;

        this.returnMarkingUtilityService.getReturnDetail(id).subscribe({
            next: (response) => {
                this.isLoading = false;
                const data = response?.data;
                if (!data) {
                    this.instrumentFound = false;
                    return;
                }

                this.instrument = this.mapDetailToInstrument(data);
                this.instrumentNumber = data.chequeNo || '';
                this.officerRemarks = data.returnReason || '';
                this.instrumentFound = true;
            },
            error: () => {
                this.isLoading = false;
                this.instrumentFound = false;
            }
        });
    }

    private mapDetailToInstrument(data: ReturnDetailData): InstrumentMetadata {
        return {
            beneficiaryTitle: data.beneficiaryTitle || '—',
            chequeNo: data.chequeNo || '—',
            accountNumber: data.accountNo || '—',
            chequeDate: this.formatDate(data.chequeDate),
            branchName: data.branchName || '—',
            returnReason: data.returnReason || '—',
            settlementAmount: data.amount || 0,
            imageF: data.imageF || '',
            imageB: data.imageB || '',
            imageU: data.imageU || ''
        };
    }

    private formatDate(dateTime: string): string {
        if (!dateTime) return '—';
        const d = new Date(dateTime);
        if (Number.isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('en-GB');
    }

    onFindInstrument(): void {
        if (!this.instrumentNumber.trim()) return;
        this.isSearching = true;
        setTimeout(() => {
            this.isSearching = false;
            this.instrumentFound = true;
        }, 600);
    }

    onFinalizeReturn(): void {
        if (!this.chequeInfoId || this.isSubmitting) {
            return;
        }

        this.isSubmitting = true;

        this.returnMarkingUtilityService.markReturn(this.chequeInfoId).subscribe({
            next: (response) => {
                this.isSubmitting = false;
                if (response?.status === 'success' || response?.statusCode === 200) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: response?.data || 'Cheque marked as return successfully',
                        confirmButtonText: 'OK',
                        customClass: {
                            confirmButton: 'btn btn-primary'
                        },
                        buttonsStyling: false
                    }).then(() => {
                        this.router.navigate(['/pages/outward-clearing/return-marking-utility']);
                    });
                    return;
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Unable to Mark Return',
                    text: response?.errorMessage || 'Something went wrong while marking return.',
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: 'btn btn-primary'
                    },
                    buttonsStyling: false
                });
            },
            error: () => {
                this.isSubmitting = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Request Failed',
                    text: 'Unable to mark return right now. Please try again.',
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: 'btn btn-primary'
                    },
                    buttonsStyling: false
                });
            }
        });
    }

    onHoldForAudit(): void {
                this.router.navigate(['/pages/outward-clearing/return-marking-utility']);
    }

    get selectedReasonLabel(): string {
        const found = this.reasonCodes.find(r => r.code === this.selectedReasonCode);
        return found ? `${found.code}: ${found.label}` : '';
    }

    formatAmount(val: number): string {
        return val.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
}
