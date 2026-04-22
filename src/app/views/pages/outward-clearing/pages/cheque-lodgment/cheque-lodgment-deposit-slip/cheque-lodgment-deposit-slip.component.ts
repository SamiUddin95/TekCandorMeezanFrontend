import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ChequeInfoItem, ChequeInfoService } from '../../../services/cheque-info.service';

@Component({
    selector: 'app-cheque-lodgment-deposit-slip',
    imports: [CommonModule],
    templateUrl: './cheque-lodgment-deposit-slip.component.html',
    styleUrl: './cheque-lodgment-deposit-slip.component.scss'
})
export class ChequeLodgmentDepositSlipComponent implements OnInit {

    trackingNumber = 'TRX-99283-MZB';
    businessDate = '08 Apr 2026';
    branchName = 'I.I. Chandigar Road Branch (0012)';
    instrumentType = 'Clearing Cheque';
    amountInWords = '';
    chequeInfoId = 0;

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

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private chequeInfoService: ChequeInfoService
    ) {}

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id')) || 0;
        this.chequeInfoId = id;

        this.applyQueryParams();

        if (id > 0) {
            this.loadChequeInfoById(id);
        }
    }

    private applyQueryParams(): void {
        const q = this.route.snapshot.queryParamMap;

        const amountStr = q.get('amount');
        const amount = amountStr !== null ? Number(amountStr) : NaN;

        const chequeNo = q.get('chequeNo') || '';
        const drawerBank = q.get('drawerBank') || '';
        const chequeDate = q.get('chequeDate') || '';
        const depositorName = q.get('depositorName') || '';
        const depositorAccount = q.get('depositorAccount') || '';
        const branchName = q.get('branchName') || '';
        const refNumber = q.get('refNumber') || '';
        const amountInWords = q.get('amountInWords') || '';

        if (refNumber) this.trackingNumber = refNumber;
        if (branchName) this.branchName = branchName;
        if (amountInWords) this.amountInWords = amountInWords;
        if (chequeDate) this.businessDate = this.formatDate(chequeDate) || this.businessDate;

        if (depositorName || depositorAccount) {
            this.depositor = {
                fullName: depositorName || this.depositor.fullName,
                accountNumber: depositorAccount || this.depositor.accountNumber,
                relationship: this.depositor.relationship
            };
        }

        const hasInstrumentData = chequeNo || drawerBank || (!Number.isNaN(amount) && amount > 0);
        if (hasInstrumentData) {
            this.instruments = [
                {
                    sNo: 1,
                    chequeNo: chequeNo || this.instruments[0].chequeNo,
                    draweeBank: drawerBank || this.instruments[0].draweeBank,
                    draweeBranch: this.instruments[0].draweeBranch,
                    clearingType: this.instruments[0].clearingType,
                    amount: !Number.isNaN(amount) && amount > 0 ? amount : this.instruments[0].amount
                }
            ];
        }
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
                    text: 'Unable to load deposit slip details.',
                    confirmButtonColor: '#5a2181'
                });
            }
        });
    }

    private applyChequeInfo(item: ChequeInfoItem): void {
        this.trackingNumber = item.referenceNo || this.trackingNumber;
        this.branchName = item.branchName || this.branchName;
        this.instrumentType = item.instrumentType || this.instrumentType;
        this.amountInWords = item.amountInWords || this.amountInWords;

        if (item.date) {
            const formatted = this.formatDate(item.date);
            if (formatted) this.businessDate = formatted;
        }

        this.depositor = {
            fullName: item.depositorTitle || this.depositor.fullName,
            accountNumber: item.accountNo || this.depositor.accountNumber,
            relationship: item.depositorType || this.depositor.relationship,
        };

        this.beneficiary = {
            titleOfAccount: item.beneficiaryTitle || this.beneficiary.titleOfAccount,
            accountNumber: item.beneficiaryAccountNumber || this.beneficiary.accountNumber,
            bankName: item.drawerBank || this.beneficiary.bankName,
        };

        this.instruments = [
            {
                sNo: 1,
                chequeNo: item.chequeNo || this.instruments[0].chequeNo,
                draweeBank: item.drawerBank || this.instruments[0].draweeBank,
                draweeBranch: item.payingBranchCode ? `Branch ${item.payingBranchCode}` : this.instruments[0].draweeBranch,
                clearingType: item.instrumentType || this.instruments[0].clearingType,
                amount: item.amount || this.instruments[0].amount
            }
        ];
    }

    private formatDate(value: string): string {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '';
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    formatAmount(val: number): string {
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    onDashboard(): void {
        this.router.navigate(['/pages/outward-clearing/cheque-lodgment/new']);
    }

    onPrint(): void {
        window.print();
    }

    onBackToList(): void {
        this.router.navigate(['/pages/outward-clearing/cheque-lodgment']);
    }
}
