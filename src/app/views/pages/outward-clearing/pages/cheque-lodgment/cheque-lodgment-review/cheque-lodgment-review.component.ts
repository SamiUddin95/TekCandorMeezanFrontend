import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '@app/services/auth.service';
import { ChequeInfoItem, ChequeInfoRequest, ChequeInfoService } from '../../../services/cheque-info.service';
import { CHEQUE_LODGMENT_SCAN_DATA } from '../cheque-lodgment-scan.data';
import { amountToWords } from '../amount-in-words.util';

@Component({
    selector: 'app-cheque-lodgment-review',
    imports: [CommonModule],
    templateUrl: './cheque-lodgment-review.component.html',
    styleUrl: './cheque-lodgment-review.component.scss'
})
export class ChequeLodgmentReviewComponent implements OnInit {

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
    reviewingAs = 'Support (Administrator)';
    lastSync = 'Today, 14:22';
    isSubmitting = false;
    id = 0;
    selectedPayingBankCode = '';
    selectedReceiverBranchCode = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private chequeInfoService: ChequeInfoService,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id')) || 0;
        this.id = id;
        this.selectedPayingBankCode = this.route.snapshot.queryParamMap.get('payingBankCode') || '';
        this.selectedReceiverBranchCode = this.route.snapshot.queryParamMap.get('receiverBranchCode') || '';

        const amountParam = this.route.snapshot.queryParamMap.get('amount');
        const parsedAmount = amountParam !== null ? Number(amountParam) : NaN;
        if (!Number.isNaN(parsedAmount) && parsedAmount > 0) {
            this.financialSettlement = {
                ...this.financialSettlement,
                totalAmount: parsedAmount,
                amountInWords: amountToWords(parsedAmount)
            };
        }

        if (id > 0) {
            this.loadChequeInfoById(id);
        }
    }

    formatAmount(val: number): string {
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    onEditDetails(): void {
        this.router.navigate(['/pages/outward-clearing/cheque-lodgment/new'], {
            queryParams: { id: this.id || 0 }
        });
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
                    text: 'Unable to load cheque details for review.',
                    confirmButtonColor: '#5a2181'
                });
            }
        });
    }

    private applyChequeInfo(item: ChequeInfoItem): void {
        this.refNumber = item.referenceNo || this.refNumber;

        this.depositorInfo = {
            accountName: item.depositorTitle || this.depositorInfo.accountName,
            accountNumber: item.accountNo || this.depositorInfo.accountNumber,
            branchName: item.branchName || this.depositorInfo.branchName,
        };

        this.instrumentDetails = {
            chequeNumber: item.chequeNo || this.instrumentDetails.chequeNumber,
            micrCode: item.micr || this.instrumentDetails.micrCode,
            instrumentDate: item.chequeDate || this.instrumentDetails.instrumentDate,
            drawerBank: item.drawerBank || this.instrumentDetails.drawerBank,
        };

        const resolvedAmount = item.amount || this.financialSettlement.totalAmount;
        this.financialSettlement = {
            totalAmount: resolvedAmount,
            amountInWords: item.amountInWords || amountToWords(resolvedAmount),
            transactionType: 'Clearing - Inward',
        };

        if (!this.selectedPayingBankCode) {
            this.selectedPayingBankCode = item.payingBankCode || '';
        }

        if (!this.selectedReceiverBranchCode) {
            this.selectedReceiverBranchCode = item.receiverBranchCode || '';
        }

        if (item.accuracy) {
            const parsed = Number(String(item.accuracy).replace('%', ''));
            if (!Number.isNaN(parsed)) {
                this.confidenceScore = parsed;
            }
        }
    }

    private buildChequeInfoPayload(): ChequeInfoRequest {
        const nowIso = new Date().toISOString();
        const currentUser = this.authService.getCurrentUser();
        const actor = currentUser?.name || currentUser?.loginName || 'System User';

        return {
            id: this.id,
            date: nowIso,
            depositorType: 'Self',
            accountNo: this.depositorInfo.accountNumber,
            cnic: '',
            depositorTitle: this.depositorInfo.accountName,
            beneficiaryAccountNumber: '',
            beneficiaryTitle: CHEQUE_LODGMENT_SCAN_DATA.beneficiary,
            accountStatus: 'Active',
            beneficiaryBranchCode: CHEQUE_LODGMENT_SCAN_DATA.payingBranchCode,
            chequeNo: CHEQUE_LODGMENT_SCAN_DATA.chequeNumber,
            payingBankCode: this.selectedPayingBankCode || CHEQUE_LODGMENT_SCAN_DATA.payingBankCode,
            payingBranchCode: CHEQUE_LODGMENT_SCAN_DATA.payingBranchCode,
            amount: this.financialSettlement.totalAmount,
            chequeDate: CHEQUE_LODGMENT_SCAN_DATA.chequeDate,
            instrumentType: CHEQUE_LODGMENT_SCAN_DATA.instrumentType,
            micr: CHEQUE_LODGMENT_SCAN_DATA.micrCode,
            ocrEngine: CHEQUE_LODGMENT_SCAN_DATA.ocrEngine,
            processingTime: CHEQUE_LODGMENT_SCAN_DATA.processingTime,
            accuracy: `${CHEQUE_LODGMENT_SCAN_DATA.confidenceScore}%`,
            imageF: '',
            imageB: '',
            imageU: '',
            currency: CHEQUE_LODGMENT_SCAN_DATA.currency,
            remarks: '',
            receiverBranchCode: this.selectedReceiverBranchCode || '',
            branchName: this.depositorInfo.branchName,
            drawerBank: this.instrumentDetails.drawerBank,
            amountInWords: this.financialSettlement.amountInWords,
            referenceNo: this.refNumber,
            depositSlipId: 0,
            status: 'P',
            isReconciled: false,
            isReturned: false,
            isRealized: false,
            createdOn: nowIso,
            createdBy: actor,
            updatedOn: nowIso,
            updatedBy: actor
        };
    }

    private handleSubmitSuccess(): void {
        this.isSubmitting = false;
        const targetId = this.id;
        this.router.navigate(['/pages/outward-clearing/cheque-lodgment/deposit-slip', targetId], {
            queryParams: {
                amount: this.financialSettlement.totalAmount || null,
                amountInWords: this.financialSettlement.amountInWords || null,
                chequeNo: this.instrumentDetails.chequeNumber || null,
                drawerBank: this.instrumentDetails.drawerBank || null,
                chequeDate: this.instrumentDetails.instrumentDate || null,
                depositorName: this.depositorInfo.accountName || null,
                depositorAccount: this.depositorInfo.accountNumber || null,
                branchName: this.depositorInfo.branchName || null,
                refNumber: this.refNumber || null,
                payingBankCode: this.selectedPayingBankCode || null
            }
        });
    }

    private handleSubmitError(): void {
        this.isSubmitting = false;
        Swal.fire({
            icon: 'error',
            title: 'Unable to Submit',
            text: 'Cheque information could not be sent to backend. Please try again.',
            confirmButtonColor: '#5a2181'
        });
    }

    onConfirmSubmit(): void {
        if (this.isSubmitting) return;

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
                this.isSubmitting = true;
                const payload = this.buildChequeInfoPayload();

                if (this.id > 0) {
                    this.chequeInfoService.updateChequeInfo(this.id, payload).subscribe({
                        next: () => this.handleSubmitSuccess(),
                        error: () => this.handleSubmitError()
                    });
                } else {
                    this.chequeInfoService.createChequeInfo(payload).subscribe({
                        next: () => this.handleSubmitSuccess(),
                        error: () => this.handleSubmitError()
                    });
                }
            }
        });
    }
}
