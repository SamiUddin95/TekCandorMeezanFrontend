import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-cheque-lodgment-scan',
    imports: [CommonModule],
    templateUrl: './cheque-lodgment-scan.component.html',
    styleUrl: './cheque-lodgment-scan.component.scss'
})
export class ChequeLodgmentScanComponent {

    chequeNumber = '00129485';
    micrCode = '043002008: 00129485: 01';
    amount = 145000;
    chequeDate = '2026-04-08';
    beneficiary = 'AL-BARAKA TEXTILES PVT LTD';
    ocrEngine = 'Vision-v4.0';
    processingTime = '0.8s';
    confidenceScore = 98.4;
    isReady = true;

    constructor(private router: Router) {}

    formatAmount(val: number): string {
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    onProceedToReview(): void {
        this.router.navigate(['/pages/outward-clearing/cheque-lodgment/review', 1]);
    }

    onDiscard(): void {
        this.router.navigate(['/pages/outward-clearing/cheque-lodgment/new']);
    }
}
