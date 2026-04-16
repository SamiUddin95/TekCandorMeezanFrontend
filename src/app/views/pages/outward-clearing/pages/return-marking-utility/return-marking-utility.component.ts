import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SessionHistoryItem {
    time: string;
    chequeNo: string;
    amount: number;
    returnReason: string;
    status: 'Marked' | 'Pending' | 'On Hold';
}

export interface InstrumentMetadata {
    drawerName: string;
    accountNumber: string;
    issueDate: string;
    branchName: string;
    processingCode: string;
    clearingCycle: string;
    settlementAmount: number;
    stampDutyPercent: number;
    stampDutyAmount: number;
    statusLabel: string;
}

@Component({
    selector: 'app-return-marking-utility',
    imports: [CommonModule, FormsModule],
    templateUrl: './return-marking-utility.component.html',
    styleUrl: './return-marking-utility.component.scss'
})
export class ReturnMarkingUtilityComponent {

    instrumentNumber = '77452168';
    isSearching = false;
    instrumentFound = true;

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
        drawerName: 'Hassan Ahmed Khan',
        accountNumber: '0010-0062744-010',
        issueDate: '22-OCT-2024',
        branchName: 'I.I Chundrigar Road 00011',
        processingCode: '0042-C',
        clearingCycle: 'Day-1 (Morning)',
        settlementAmount: 85750.00,
        stampDutyPercent: 0.75,
        stampDutyAmount: 85.76,
        statusLabel: 'ACTIVE IN CLEARING'
    };

    sessionHistory: SessionHistoryItem[] = [
        { time: '10:45 AM', chequeNo: '90012031', amount: 45000.00,  returnReason: 'Insufficient Funds', status: 'Marked' },
        { time: '11:02 AM', chequeNo: '90012038', amount: 125300.00, returnReason: 'Post Dated',         status: 'Marked' },
        { time: '11:30 AM', chequeNo: '90012045', amount: 8200.00,   returnReason: 'Signature Mismatch', status: 'Marked' },
        { time: '11:45 AM', chequeNo: '90012048', amount: 15000.00,  returnReason: 'Instruments Altered', status: 'Marked' },
        { time: '12:05 PM', chequeNo: '90012055', amount: 250000.00, returnReason: 'Insufficient Funds', status: 'Marked' },
    ];

    sessionId = 'SHK-8';

    onFindInstrument(): void {
        if (!this.instrumentNumber.trim()) return;
        this.isSearching = true;
        setTimeout(() => {
            this.isSearching = false;
            this.instrumentFound = true;
        }, 600);
    }

    onFinalizeReturn(): void {
        console.log('Finalize Return:', {
            instrumentNumber: this.instrumentNumber,
            reasonCode: this.selectedReasonCode,
            remarks: this.officerRemarks,
            isInternal: this.isInternal
        });
    }

    onHoldForAudit(): void {
        console.log('Hold for Manual Audit:', this.instrumentNumber);
    }

    get selectedReasonLabel(): string {
        const found = this.reasonCodes.find(r => r.code === this.selectedReasonCode);
        return found ? `${found.code}: ${found.label}` : '';
    }

    formatAmount(val: number): string {
        return val.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
}
