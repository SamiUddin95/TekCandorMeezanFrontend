import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-cheque-lodgment-review',
    imports: [CommonModule],
    templateUrl: './cheque-lodgment-review.component.html',
    styleUrl: './cheque-lodgment-review.component.scss'
})
export class ChequeLodgmentReviewComponent {

    refNumber = 'TXN-77489-B2';
    validationPassed = true;
    confidenceScore = 99.8;

    depositorInfo = {
        accountName: 'PAKISTAN TEXTILE CORP LTD',
        accountNumber: '0102-910558490I-PKR',
        branchName: 'Main Branch, Karachi',
    };

    instrumentDetails = {
        chequeNumber: '55489201',
        micrCode: '021-01012-0648-00',
        instrumentDate: '05-APR-2026',
        drawerBank: 'Habib Bank Limited (HBL)',
    };

    financialSettlement = {
        totalAmount: 450000,
        amountInWords: 'Four Hundred Fifty Thousand Rupees Only',
        transactionType: 'Clearing - Inward',
    };

    selectedMode = 'Live Settlement (ICS)';
    reviewingAs = 'Yusuf Ahmed (Officer)';
    lastSync = 'Today, 14:22';

    constructor(private router: Router) {}

    formatAmount(val: number): string {
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    onEditDetails(): void {
        this.router.navigate(['/pages/outward-clearing/cheque-lodgment/new']);
    }

    onConfirmSubmit(): void {
        Swal.fire({
            title: 'Confirm & Submit?',
            text: 'This will finalize the transaction and generate a deposit slip.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#5a2181',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Submit',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                this.router.navigate(['/pages/outward-clearing/cheque-lodgment/deposit-slip', 1]);
            }
        });
    }
}
