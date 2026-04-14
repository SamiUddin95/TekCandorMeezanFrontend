import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-cheque-lodgment-deposit-slip',
    imports: [CommonModule],
    templateUrl: './cheque-lodgment-deposit-slip.component.html',
    styleUrl: './cheque-lodgment-deposit-slip.component.scss'
})
export class ChequeLodgmentDepositSlipComponent {

    trackingNumber = 'TRX-99283-MZB';
    businessDate = '08 Apr 2026';
    branchName = 'I.I. Chandigar Road Branch (0012)';
    instrumentType = 'Clearing Cheque';

    depositor = {
        fullName: 'Ahmed Raza',
        accountNumber: '0102-010244556',
        relationship: 'Self',
    };

    beneficiary = {
        titleOfAccount: 'Siddique Trading Co.',
        accountNumber: '0098-776655443',
        bankName: 'Meezan Bank Ltd.',
    };

    instruments = [
        { sNo: 1, chequeNo: '88273641', draweeBank: 'Habib Bank Limited', draweeBranch: 'Main Boulevard, Lahore', clearingType: 'NIFT Standard', amount: 150000 },
    ];

    get totalAmount(): number {
        return this.instruments.reduce((sum, i) => sum + i.amount, 0);
    }

    constructor(private router: Router) {}

    formatAmount(val: number): string {
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    onDashboard(): void {
        this.router.navigate(['/dashboard']);
    }

    onPrint(): void {
        window.print();
    }

    onBackToList(): void {
        this.router.navigate(['/pages/outward-clearing/cheque-lodgment']);
    }
}
