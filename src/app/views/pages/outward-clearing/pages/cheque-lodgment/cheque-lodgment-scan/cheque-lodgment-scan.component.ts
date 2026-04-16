import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CHEQUE_LODGMENT_SCAN_DATA } from '../cheque-lodgment-scan.data';

@Component({
    selector: 'app-cheque-lodgment-scan',
    imports: [CommonModule],
    templateUrl: './cheque-lodgment-scan.component.html',
    styleUrl: './cheque-lodgment-scan.component.scss'
})
export class ChequeLodgmentScanComponent implements OnInit {

    chequeNumber = CHEQUE_LODGMENT_SCAN_DATA.chequeNumber;
    micrCode = CHEQUE_LODGMENT_SCAN_DATA.micrCode;
    amount = CHEQUE_LODGMENT_SCAN_DATA.amount;
    chequeDate = CHEQUE_LODGMENT_SCAN_DATA.chequeDate;
    beneficiary = CHEQUE_LODGMENT_SCAN_DATA.beneficiary;
    ocrEngine = CHEQUE_LODGMENT_SCAN_DATA.ocrEngine;
    processingTime = CHEQUE_LODGMENT_SCAN_DATA.processingTime;
    confidenceScore = CHEQUE_LODGMENT_SCAN_DATA.confidenceScore;
    isReady = true;
    chequeInfoId = 0;

    constructor(
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.chequeInfoId = Number(this.route.snapshot.paramMap.get('id')) || 0;
    }

    formatAmount(val: number): string {
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    onProceedToReview(): void {
        this.router.navigate(['/pages/outward-clearing/cheque-lodgment/review', this.chequeInfoId]);
    }

    onDiscard(): void {
        this.router.navigate(['/pages/outward-clearing/cheque-lodgment/new'], {
            queryParams: { id: this.chequeInfoId }
        });
    }
}
