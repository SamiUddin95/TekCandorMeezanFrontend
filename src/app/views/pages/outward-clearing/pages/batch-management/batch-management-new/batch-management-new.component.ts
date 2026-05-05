import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ChequeInfoService, ChequeInfoRequest } from '../../../services/cheque-info.service';
import { BatchManagementService, InstrumentDetails } from '../../../services/batch-management.service';
import { FilterService, BranchItem, BankItem } from '../../../services/filter.service';

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
export class BatchManagementNewComponent implements OnInit {

    batchId = '';
    maxInstruments = 50;
    lastSaved = '';
    batchStatus = 'Draft';
    editMode = false;

    get totalInstruments(): string {
        return `${this.instruments.length} / ${this.maxInstruments || this.instruments.length}`;
    }

    get batchTotal(): string {
        const total = this.instruments.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
        return `PKR ${this.formatAmount(total)}`;
    }

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
    isSaving = false;
    isSubmittingDraft = false;
    isAuthorizing = false;

    branches: BranchItem[] = [];
    banks: BankItem[] = [];

    // Scan result / verification panel state
    hasScanned = false;
    scanOcrEngine = '';
    scanProcessingTime = '';
    scanAccuracy = '';
    scanAmountInWords = '';
    scanStatus: 'Ready for Review' | 'Pending' = 'Pending';

    chequeView: 'front' | 'back' = 'front';

    // Recent Instruments
    instruments: BatchInstrumentItem[] = [];

    stats = {
        validated: 0,
        captured: 0,
        exceptions: 0
    };

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private chequeInfoService: ChequeInfoService,
        private batchManagementService: BatchManagementService,
        private filterService: FilterService
    ) {
        const batchIdFromQuery = this.route.snapshot.queryParamMap.get('batchId');
        const batchIdFromSession = sessionStorage.getItem('outward.activeBatchId');
        this.batchId = batchIdFromQuery || batchIdFromSession || this.batchId;
        this.editMode = this.route.snapshot.queryParamMap.get('mode') === 'edit';
    }

    ngOnInit(): void {
        this.loadBranches();
        this.loadBanks();
        if (this.editMode && this.batchId) {
            this.loadBatchInstruments();
        }
    }

    private loadBranches(): void {
        this.filterService.getBranches().subscribe({
            next: (res) => {
                this.branches = res?.status === 'success' ? (res.data?.branches || []) : [];
            },
            error: () => { this.branches = []; }
        });
    }

    private loadBanks(): void {
        this.filterService.getBanks().subscribe({
            next: (res) => {
                this.banks = res?.status === 'success' ? (res.data?.banks || []) : [];
            },
            error: () => { this.banks = []; }
        });
    }

    private loadBatchInstruments(): void {
        if (!this.batchId) return;
        this.batchManagementService.getBatchInstruments(this.batchId).subscribe({
            next: (response) => {
                if (response.status === 'success' && response.data) {
                    const batchData = response.data.batch;
                    const instrumentData = response.data.instruments;
                    
                    this.batchStatus = batchData.status || 'Draft';
                    this.maxInstruments = batchData.maxInstruments || 50;
                    
                    this.instruments = instrumentData.map((inst: InstrumentDetails, index: number) => ({
                        sNo: index + 1,
                        chequeNo: inst.chequeNo || '',
                        accountNo: inst.accountNo || '',
                        draweeBank: inst.drawerBank || inst.payingBankCode || 'N/A',
                        amount: inst.amount || 0,
                        status: 'Captured'
                    }));
                    
                    this.stats.captured = this.instruments.filter(i => i.status === 'Captured').length;
                    this.stats.validated = this.instruments.filter(i => i.status === 'Validated').length;
                    this.stats.exceptions = this.instruments.filter(i => i.status === 'Exception').length;
                }
            },
            error: (err) => {
                console.error('Error loading batch instruments:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Load Failed',
                    text: 'Unable to load batch instruments. Please try again.'
                });
            }
        });
    }

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
        // Populate left form + right verification panel from OCR scan data
        this.chequeNumber = '00129485';
        this.micrCode = '043002008: 00129485: 01';
        this.amount = 145000;
        this.chequeDate = '2026-04-08';
        this.beneficiaryTitle = 'AL-BARAKA TEXTILES PVT LTD';
        this.instrumentType = 'Cheque';
        this.currency = 'PKR - Pak Rupee';
        this.payingBankCode = this.payingBankCode || '101';
        this.payingBranchCode = this.payingBranchCode || '008';

        this.scanOcrEngine = 'Vision-v4.0';
        this.scanProcessingTime = '0.8s';
        this.scanAccuracy = '98.4%';
        this.scanAmountInWords = 'One Lakh Forty Five Thousand Rupees Only';
        this.scanStatus = 'Ready for Review';
        this.hasScanned = true;
    }

    onSave(): void {
        if (!this.chequeNumber || !this.amount) {
            Swal.fire({ icon: 'warning', title: 'Missing data', text: 'Cheque number and amount are required.' });
            return;
        }

        const nowIso = new Date().toISOString();
        const payload: ChequeInfoRequest = {
            id: 0,
            date: nowIso,
            depositorType: this.depositorType,
            accountNo: this.accountNumber || '',
            cnic: this.cnic || '',
            depositorTitle: this.fullName || '',
            beneficiaryAccountNumber: this.beneficiaryAccount || '',
            beneficiaryTitle: this.beneficiaryTitle || '',
            accountStatus: this.accountStatus || '',
            beneficiaryBranchCode: this.beneficiaryBranchCode || '',
            chequeNo: this.chequeNumber || '',
            payingBankCode: this.payingBankCode || '',
            payingBranchCode: this.payingBranchCode || '',
            amount: Number(this.amount) || 0,
            chequeDate: this.chequeDate || '',
            instrumentType: this.instrumentType || '',
            micr: this.micrCode || '',
            ocrEngine: this.scanOcrEngine || '',
            processingTime: this.scanProcessingTime || '',
            accuracy: this.scanAccuracy || '',
            imageF: '',
            imageB: '',
            imageU: '',
            currency: (this.currency || '').split(' ')[0] || 'PKR',
            remarks: this.remarks || '',
            receiverBranchCode: this.receiverBranchCode || '',
            branchName: '',
            drawerBank: this.payingBankCode || '',
            amountInWords: this.scanAmountInWords || '',
            referenceNo: '',
            depositSlipId: 0,
            status: 'U',
            isReconciled: false,
            isReturned: false,
            isRealized: false,
            createdOn: nowIso,
            createdBy: '',
            updatedOn: nowIso,
            updatedBy: ''
        };

        // Include batchId if backend supports it (property is optional in request shape)
        (payload as any).hubcode = '';
        (payload as any).batchId = this.batchId || null;

        this.isSaving = true;
        this.chequeInfoService.createChequeInfo(payload).subscribe({
            next: (response: any) => {
                this.isSaving = false;
                const saved = response?.data;
                if ((response?.status === 'success' || response?.statusCode === 201) && saved) {
                    this.appendInstrumentFromResponse(saved);
                    Swal.fire({ icon: 'success', title: 'Saved', text: 'Instrument saved successfully.', timer: 1500, showConfirmButton: false });
                    this.clearForm();
                    this.hasScanned = false;
                } else {
                    Swal.fire({ icon: 'error', title: 'Save failed', text: response?.errorMessage || 'Unable to save instrument.' });
                }
            },
            error: (err) => {
                this.isSaving = false;
                Swal.fire({ icon: 'error', title: 'Save failed', text: err?.error?.errorMessage || 'Unable to save instrument.' });
            }
        });
    }

    private appendInstrumentFromResponse(data: any): void {
        const item: BatchInstrumentItem = {
            sNo: this.instruments.length + 1,
            chequeNo: data.chequeNo || '',
            accountNo: data.accountNo || '',
            draweeBank: data.drawerBank || data.payingBankCode || 'N/A',
            amount: Number(data.amount) || 0,
            status: 'Captured'
        };
        this.instruments = [...this.instruments, item];
        this.stats.captured = this.instruments.filter(i => i.status === 'Captured').length;
        this.stats.validated = this.instruments.filter(i => i.status === 'Validated').length;
        this.stats.exceptions = this.instruments.filter(i => i.status === 'Exception').length;
    }

    onSaveDraft(): void {
        if (!this.batchId || this.instruments.length === 0 || this.isSubmittingDraft) {
            return;
        }
        this.isSubmittingDraft = true;
        this.batchManagementService.submitBatch(this.batchId).subscribe({
            next: (response: any) => {
                this.isSubmittingDraft = false;
                if ((response?.status === 'success' || response?.statusCode === 200) && response?.data) {
                    const d = response.data;
                    this.batchStatus = d.status || 'Submitted';
                    this.maxInstruments = d.maxInstruments || this.maxInstruments;
                    this.lastSaved = 'Saved as draft';
                    Swal.fire({ icon: 'success', title: 'Draft saved', text: `Batch ${d.batchId} submitted.`, timer: 1800, showConfirmButton: false });
                } else {
                    Swal.fire({ icon: 'error', title: 'Failed', text: response?.errorMessage || 'Unable to save draft.' });
                }
            },
            error: (err) => {
                this.isSubmittingDraft = false;
                Swal.fire({ icon: 'error', title: 'Failed', text: err?.error?.errorMessage || 'Unable to save draft.' });
            }
        });
    }

    // onAddInstrument(): void {
    //     if (!this.chequeNumber || !this.amount) return;
    //     this.instruments.push({
    //         sNo: this.instruments.length + 1,
    //         chequeNo: this.chequeNumber,
    //         accountNo: this.accountNumber,
    //         draweeBank: this.payingBankCode || 'N/A',
    //         amount: this.amount,
    //         status: 'Captured'
    //     });
    //     this.clearForm();
    // }

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

    onSubmitForAuth(): void {
        if (!this.batchId || this.instruments.length === 0 || this.isAuthorizing) {
            return;
        }
        this.isAuthorizing = true;
        this.batchManagementService.authorizeBatch(this.batchId).subscribe({
            next: (response: any) => {
                this.isAuthorizing = false;
                if ((response?.status === 'success' || response?.statusCode === 200) && response?.data) {
                    const d = response.data;
                    Swal.fire({
                        icon: 'success',
                        title: 'Authorized',
                        text: `Batch ${d.batchId} ${d.status?.toLowerCase() || 'authorized'}.`,
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        sessionStorage.removeItem('outward.activeBatchId');
                        this.router.navigate(['/pages/outward-clearing/batch-management']);
                    });
                } else {
                    Swal.fire({ icon: 'error', title: 'Failed', text: response?.errorMessage || 'Unable to authorize batch.' });
                }
            },
            error: (err) => {
                this.isAuthorizing = false;
                Swal.fire({ icon: 'error', title: 'Failed', text: err?.error?.errorMessage || 'Unable to authorize batch.' });
            }
        });
    }

    onBackToList(): void {
        this.router.navigate(['/pages/outward-clearing/batch-management']);
    }

    formatAmount(val: number): string {
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
}
