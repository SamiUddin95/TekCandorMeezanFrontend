import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ChequeInfoItem, ChequeInfoService } from '../../../services/cheque-info.service';

@Component({
    selector: 'app-cheque-lodgment-new',
    imports: [CommonModule, FormsModule],
    templateUrl: './cheque-lodgment-new.component.html',
    styleUrl: './cheque-lodgment-new.component.scss'
})
export class ChequeLodgmentNewComponent implements OnInit {

    depositorType: 'Self' | 'MBL Account Holder' | 'Walk-in' = 'Self';
    depositorAccount = '';
    cnic = '';
    fullName = '';
    beneficiaryAccount = '';
    beneficiaryBranchCode = '';
    beneficiaryTitle = '';
    currency = 'PKR - Pak Rupee';
    accountStatus = '';
    instrumentAmount: number | null = null;
    remarks = '';
    chequeNumber = '';
    payingBankCode = '';
    payingBranchCode = '';
    instrumentType = '';
    chequeInfoId = 0;

    currentStep = 1;
    isFetchingDepositor = false;
    isFetchingBeneficiary = false;

    preScanChecks = [
        { label: 'Verify instrument is not stale (within 6 months).', checked: false },
        { label: 'Ensure numerical and words amount match.', checked: false },
        { label: 'Confirm presence of drawer signature.', checked: false },
    ];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private chequeInfoService: ChequeInfoService
    ) {}

    ngOnInit(): void {
        const id = Number(this.route.snapshot.queryParamMap.get('id')) || 0;
        this.chequeInfoId = id;
        if (id > 0) {
            this.loadChequeInfoById(id);
        }
    }

    get isWalkIn(): boolean {
        return this.depositorType === 'Walk-in';
    }

    get allChecksCompleted(): boolean {
        return this.preScanChecks.every(c => c.checked);
    }

    get isFormValid(): boolean {
        const depositorFieldValid = this.isWalkIn ? !!this.cnic : !!this.depositorAccount;
        return depositorFieldValid && !!this.fullName && !!this.beneficiaryAccount;
    }

    onDepositorTypeChange(): void {
        this.depositorAccount = '';
        this.cnic = '';
        this.fullName = '';
    }

    onFetchDepositor(): void {
        if (!this.depositorAccount) return;
        this.isFetchingDepositor = true;
        setTimeout(() => {
            this.fullName = 'Muhammad Ahmed Khan';
            this.isFetchingDepositor = false;
        }, 800);
    }

    private loadChequeInfoById(id: number): void {
        this.chequeInfoService.getChequeInfoById(id).subscribe({
            next: (response) => {
                const item = response?.data;
                if (!item) return;
                this.applyChequeInfo(item);
            },
            error: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Load Failed',
                    text: 'Unable to load cheque details for editing.',
                    confirmButtonColor: '#5a2181'
                });
            }
        });
    }

    private applyChequeInfo(item: ChequeInfoItem): void {
        this.depositorType = (item.depositorType as 'Self' | 'MBL Account Holder' | 'Walk-in') || 'Self';
        this.depositorAccount = item.accountNo || '';
        this.cnic = item.cnic || '';
        this.fullName = item.depositorTitle || '';

        this.beneficiaryAccount = item.beneficiaryAccountNumber || '';
        this.beneficiaryTitle = item.beneficiaryTitle || '';
        this.accountStatus = item.accountStatus || '';
        this.beneficiaryBranchCode = item.beneficiaryBranchCode || '';

        this.chequeNumber = item.chequeNo || '';
        this.payingBankCode = item.payingBankCode || '';
        this.payingBranchCode = item.payingBranchCode || '';
        this.instrumentType = item.instrumentType || '';
        this.instrumentAmount = item.amount || null;

        if (item.currency === 'PKR') {
            this.currency = 'PKR - Pak Rupee';
        } else if (item.currency) {
            this.currency = item.currency;
        }

        this.remarks = item.remarks || '';
    }

    onFetchBeneficiary(): void {
        if (!this.beneficiaryAccount) return;
        this.isFetchingBeneficiary = true;
        setTimeout(() => {
            this.beneficiaryTitle = 'Faisal Industries Ltd.';
            this.accountStatus = 'Active';
            this.beneficiaryBranchCode = '0145';
            this.isFetchingBeneficiary = false;
        }, 800);
    }

    formatAmount(val: number | null): string {
        if (!val) return '0.00';
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    onCancel(): void {
        this.router.navigate(['/pages/outward-clearing/cheque-lodgment']);
    }

    onScanCheque(): void {
        this.router.navigate(['/pages/outward-clearing/cheque-lodgment/scan', this.chequeInfoId]);
    }
}
