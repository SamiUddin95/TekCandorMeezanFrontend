import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-cheque-lodgment-new',
    imports: [CommonModule, FormsModule],
    templateUrl: './cheque-lodgment-new.component.html',
    styleUrl: './cheque-lodgment-new.component.scss'
})
export class ChequeLodgmentNewComponent {

    depositorType: 'Self' | 'MBL Account Holder' | 'Walk-in' = 'Self';
    depositorAccount = '';
    cnic = '';
    fullName = '';
    beneficiaryAccount = '';
    currency = 'PKR - Pak Rupee';
    instrumentAmount: number | null = null;
    remarks = '';

    currentStep = 1;

    preScanChecks = [
        { label: 'Verify instrument is not stale (within 6 months).', checked: false },
        { label: 'Ensure numerical and words amount match.', checked: false },
        { label: 'Confirm presence of drawer signature.', checked: false },
    ];

    constructor(private router: Router) {}

    get isWalkIn(): boolean {
        return this.depositorType === 'Walk-in';
    }

    get allChecksCompleted(): boolean {
        return this.preScanChecks.every(c => c.checked);
    }

    get isFormValid(): boolean {
        const depositorFieldValid = this.isWalkIn ? !!this.cnic : !!this.depositorAccount;
        return depositorFieldValid && !!this.fullName && !!this.beneficiaryAccount && !!this.instrumentAmount;
    }

    onDepositorTypeChange(): void {
        this.depositorAccount = '';
        this.cnic = '';
        this.fullName = '';
    }

    onDepositorAccountBlur(): void {
        if (this.depositorAccount) {
            this.fullName = 'Auto fetched title';
        }
    }

    onCnicBlur(): void {
        if (this.cnic) {
            this.fullName = 'Auto fetched title';
        }
    }

    formatAmount(val: number | null): string {
        if (!val) return '0.00';
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    onCancel(): void {
        this.router.navigate(['/pages/outward-clearing/cheque-lodgment']);
    }

    onScanCheque(): void {
        this.router.navigate(['/pages/outward-clearing/cheque-lodgment/scan', 1]);
    }
}
