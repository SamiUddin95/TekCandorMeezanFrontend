import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface BatchInstrumentItem {
    sNo: number;
    chequeNo: string;
    accountNo: string;
    draweeBank: string;
    amount: number;
    status: 'Validated' | 'Captured' | 'Exception';
}

@Component({
    selector: 'app-batch-management-new',
    imports: [CommonModule, FormsModule],
    templateUrl: './batch-management-new.component.html',
    styleUrl: './batch-management-new.component.scss'
})
export class BatchManagementNewComponent {

    batchId = 'BCH-20231024-0042';
    totalInstruments = '12 / 50';
    batchTotal = '$ 142,450.00';
    lastSaved = 'Last saved 2 mins ago';
    batchStatus = 'Draft';

    // Instrument Details
    depositorType: 'Self' | 'MBL Account Holder' | 'Walk-in' = 'Self';
    accountNumber = '';
    chequeNumber = '';
    cnic = '';
    fullName = '';
    beneficiaryAccount = '';
    beneficiaryTitle = '';
    payingBankCode = '';
    payingBranchCode = '';
    accountStatus = '';
    beneficiaryBranchCode = '';
    receiverBranchCode = '';
    instrumentType = '';
    currency = 'PKR - Pak Rupee';
    amount: number | null = null;
    chequeDate = '';
    type: 'On-Us' | 'Off-Us' = 'On-Us';
    remarks = '';
    micrCode = '';

    isFetchingDepositor = false;
    isFetchingBeneficiary = false;

    chequeView: 'front' | 'back' = 'front';

    // Recent Instruments
    instruments: BatchInstrumentItem[] = [
        { sNo: 1, chequeNo: '455012', accountNo: '00628811920', draweeBank: 'J.P. Morgan', amount: 12450, status: 'Validated' },
        { sNo: 2, chequeNo: '102938', accountNo: '99281112001', draweeBank: 'Bank of America', amount: 4500, status: 'Captured' },
        { sNo: 3, chequeNo: '887123', accountNo: '11203344928', draweeBank: 'Wells Fargo', amount: 28000.50, status: 'Exception' },
        { sNo: 4, chequeNo: '900211', accountNo: '44502219983', draweeBank: 'Citigroup', amount: 1200, status: 'Validated' },
        { sNo: 5, chequeNo: '331001', accountNo: '88271100022', draweeBank: 'HSBC Bank', amount: 7500, status: 'Validated' },
    ];

    stats = {
        validated: 3,
        captured: 1,
        exceptions: 1
    };

    constructor(private router: Router) {}

    get isWalkIn(): boolean {
        return this.depositorType === 'Walk-in';
    }

    onDepositorTypeChange(): void {
        this.accountNumber = '';
        this.cnic = '';
        this.fullName = '';
    }

    onFetchDepositor(): void {
        if (!this.accountNumber) return;
        this.isFetchingDepositor = true;
        setTimeout(() => {
            this.fullName = 'Muhammad Ahmed Khan';
            this.isFetchingDepositor = false;
        }, 800);
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

    onScanCheque(): void {
        console.log('Scan cheque triggered');
    }

    onAddInstrument(): void {
        if (!this.chequeNumber || !this.amount) return;
        this.instruments.push({
            sNo: this.instruments.length + 1,
            chequeNo: this.chequeNumber,
            accountNo: this.accountNumber,
            draweeBank: this.payingBankCode || 'N/A',
            amount: this.amount,
            status: 'Captured'
        });
        this.clearForm();
    }

    onClearForm(): void {
        this.clearForm();
    }

    private clearForm(): void {
        this.accountNumber = '';
        this.chequeNumber = '';
        this.fullName = '';
        this.beneficiaryAccount = '';
        this.beneficiaryTitle = '';
        this.payingBankCode = '';
        this.payingBranchCode = '';
        this.accountStatus = '';
        this.beneficiaryBranchCode = '';
        this.receiverBranchCode = '';
        this.instrumentType = '';
        this.amount = null;
        this.chequeDate = '';
        this.remarks = '';
        this.micrCode = '';
    }

    onSaveDraft(): void {
        console.log('Save as draft');
    }

    onSubmitForAuth(): void {
        console.log('Submit for authorization');
    }

    onBackToList(): void {
        this.router.navigate(['/pages/outward-clearing/batch-management']);
    }

    formatAmount(val: number): string {
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
}
