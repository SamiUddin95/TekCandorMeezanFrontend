import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ChequeInfoService, ChequeInfoRequest } from '../../../services/cheque-info.service';
import { BatchManagementService, InstrumentDetails } from '../../../services/batch-management.service';
import { FilterService, BranchItem, BankItem } from '../../../services/filter.service';
import { ChequeScannerService, NormalizedScannedCheque } from '../../../services/cheque-scanner.service';
import { SpinnerComponent } from '@app/components/spinner/spinner.component';
import { NgIcon } from '@ng-icons/core';

export type MicrRowKey = 'chequeNo' | 'bankBranch' | 'accountNo' | 'amount';
export type MicrRowStatus = 'matched' | 'notMatched' | null;

export interface MicrParts {
    chequeNo: string;
    bankBranch: string;
    accountNo: string;
}

export interface BatchInstrumentItem {
    id: number;
    sNo: number;
    chequeNo: string;
    accountNo: string;
    draweeBank: string;
    drawerBankName : string;
    city: string;
    depositSlipId: string;
    cycle: string;
    amount: number;
    status: 'Validated' | 'Captured' | 'Exception';
}

@Component({
    selector: 'app-batch-management-new',
    imports: [CommonModule, FormsModule, SpinnerComponent, NgIcon],
    templateUrl: './batch-management-new.component.html',
    styleUrl: './batch-management-new.component.scss'
})
export class BatchManagementNewComponent implements OnInit {

    batchId = '';
    maxInstruments = 50;
    lastSaved = '';
    batchStatus = 'Draft';
    editMode = false;
    isLoadingInstruments = false;
    editingInstrumentId: number | null = null;
    isLoadingInstrument = false;

    get totalInstruments(): string {
        return `${this.instruments.length} / ${this.maxInstruments || this.instruments.length}`;
    }

    get batchTotal(): string {
        const total = this.instruments.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
        return `PKR ${this.formatAmount(total)}`;
    }

    // Instrument Details
    depositorType: 'Self' | 'MBL Account Holder' | 'Walk-in' = 'Walk-in';
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
    city = 'Karachi';
    depositSlipId = '';
    cycle = 'PECS-I';
    instrumentType = '';
    currency = 'PKR - Pak Rupee';
    amount: number | null = null;
    chequeDate = new Date().toISOString().slice(0, 10);
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
    scanStatus: 'Ready for Review' | 'Pending' | 'MICR Mismatch' = 'Pending';

    chequeView: 'front' | 'back' | 'Ultra' = 'front';

    // Scanner state (Bancor device / demo fallback)
    isScanning = false;
    scanSource: 'device' | 'demo' | '' = '';
    scannedCheques: NormalizedScannedCheque[] = [];
    activeScanIndex = 0;
    scanFrontImage = '';
    scanBackImage = '';
    scanUvImage = '';
    scanMicrOcr = '';
    /** true = MICR matched MICR_OCR (valid), false = mismatch (fraud), null = not scanned */
    micrMatch: boolean | null = null;

    // MICR verification grid (Particulars | MICR | OCR | Matched | Not Matched | User Input)
    readonly micrRows: { key: MicrRowKey; label: string }[] = [
        { key: 'chequeNo', label: 'Cheque Number' },
        { key: 'bankBranch', label: 'Bank - Branch' },
        { key: 'accountNo', label: 'Account Number' },
        { key: 'amount', label: 'Amount' }
    ];
    /** Manual Matched / Not Matched selections; rows without an entry are auto-evaluated. */
    micrStatusOverride: Partial<Record<MicrRowKey, 'matched' | 'notMatched' | 'none'>> = {};

    // Cheque Analytics tabs (Verification Panel)
    activeAnalyticsTab: 'quality' | 'validation' | 'risk' = 'risk';
    readonly analyticsTabs = [
        { key: 'quality' as const, title: 'Image Quality', done: 12, total: 14, note: '2 critical', alert: true },
        { key: 'validation' as const, title: 'Validation', done: 7, total: 11, note: '4 to verify', alert: false },
        { key: 'risk' as const, title: 'Risk Parameters', done: 5, total: 8, note: '3 to verify', alert: false }
    ];
    readonly imageQualityChecks = [
        { icon: 'tablerAlertTriangle', tone: 'warn', label: 'IQ Tag', value: 'Not Available' },
        { icon: 'tablerAlertTriangle', tone: 'warn', label: 'QR Code Match', value: 'Not Available' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'Image Encrypted', value: 'YES' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'Image Too Dark', value: 'NO' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'Image Too Light', value: 'NO' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'Framing Error', value: 'NO' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'Document Skew', value: 'NO' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'Piggy Back', value: 'NO' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'Horizontal Streaks', value: 'NO' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'Oversized Instrument', value: 'NO' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'Compressed Img Size', value: 'Standard' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'Front Rear Dimension', value: 'Match' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'Carbon Strip Detected', value: 'NO' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'Out of Focus', value: 'NO' }
    ];
    readonly validationChecks = [
        { icon: 'tablerAlertTriangle', tone: 'warn', label: 'Pre Auth', value: 'NO' },
        { icon: 'tablerAlertTriangle', tone: 'warn', label: 'Date', value: 'Not Available' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'Fake MICR', value: 'NO' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'MICR Status', value: 'Standard' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'UV Percentage', value: '69' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'Amount Limit Exceeded', value: 'NO' },
        { icon: 'tablerAlertTriangle', tone: 'warn', label: 'Payee Name', value: 'Not Available' },
        { icon: 'tablerAlertTriangle', tone: 'warn', label: 'Amount', value: 'Not Available' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'QR Present', value: 'YES' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'MICR & QR Matching', value: 'Matched' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'Branch Merged', value: 'NO' }
    ];
    readonly riskParameters = [
        { icon: 'tablerAlertTriangle', tone: 'warn', label: 'Fraud in Beneficiary Account', value: 'NO' },
        { icon: 'tablerAlertTriangle', tone: 'warn', label: 'First-Time Issuer', value: 'YES' },
        { icon: 'tablerAlertTriangle', tone: 'warn', label: 'Cheque Cleared Pattern', value: 'N/A' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'Duplicate Detection', value: 'NO' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'Cheque Presentment Count', value: '0' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'Fraud in Issuer Account', value: 'NO' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'First-Time Beneficiary', value: 'NO' },
        { icon: 'tablerCircleCheck', tone: 'ok', label: 'Outlier Cheque', value: 'NO' }
    ];

    get activeScanImage(): string {
        if (this.chequeView === 'front') return this.scanFrontImage;
        if (this.chequeView === 'back') return this.scanBackImage;
        return this.scanUvImage;
    }

    // Scan image viewer state (zoom / rotate / brightness / contrast / magnifier)
    scanZoom = 1;
    scanRotation = 0;
    scanBrightness = 100;
    scanContrast = 100;
    scanPanX = 0;
    scanPanY = 0;
    isScanDragging = false;
    private scanDragStartX = 0;
    private scanDragStartY = 0;
    showScanMagnifier = false;
    scanMagnifierX = 0;
    scanMagnifierY = 0;
    scanMagnifierBgPosition = '0 0';

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
        private filterService: FilterService,
        private chequeScannerService: ChequeScannerService
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
        this.isLoadingInstruments = true;
        this.batchManagementService.getBatchInstruments(this.batchId).subscribe({
            next: (response) => {
                this.isLoadingInstruments = false;
                if (response.status === 'success' && response.data) {
                    const batchData = response.data.batch;
                    const instrumentData = response.data.instruments;
                    
                    this.batchStatus = batchData.status || 'Draft';
                    this.maxInstruments = batchData.maxInstruments || 50;
                    
                    this.instruments = instrumentData.map((inst: InstrumentDetails, index: number) => ({
                        id: inst.id,
                        sNo: index + 1,
                        chequeNo: inst.chequeNo || '',
                        accountNo: inst.accountNo || '',
                        draweeBank: inst.drawerBank || inst.payingBankCode || 'N/A',
                        drawerBankName: inst.drawerBankName || 'N/A',
                        city: (inst as any).city || '',
                        depositSlipId: inst.depositSlipId != null ? String(inst.depositSlipId) : '',
                        cycle: (inst as any).cycle || '',
                        amount: inst.amount || 0,
                        status: 'Captured'
                    }));
                    
                    this.stats.captured = this.instruments.filter(i => i.status === 'Captured').length;
                    this.stats.validated = this.instruments.filter(i => i.status === 'Validated').length;
                    this.stats.exceptions = this.instruments.filter(i => i.status === 'Exception').length;
                }
            },
            error: (err) => {
                this.isLoadingInstruments = false;
                console.error('Error loading batch instruments:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Load Failed',
                    text: 'Unable to load batch instruments. Please try again.'
                });
            }
        });
    }

    onEditInstrument(instrumentId: number): void {
        if (!instrumentId || this.isLoadingInstrument) return;
        this.isLoadingInstrument = true;
        this.chequeInfoService.getChequeInfoById(instrumentId).subscribe({
            next: (response) => {
                this.isLoadingInstrument = false;
                if (response.status === 'success' && response.data) {
                    const d = response.data;
                    this.editingInstrumentId = d.id;
                    this.depositorType = (d.depositorType as any) || 'Self';
                    this.accountNumber = d.accountNo || '';
                    this.cnic = d.cnic || '';
                    this.fullName = d.depositorTitle || '';
                    this.beneficiaryAccount = d.beneficiaryAccountNumber || '';
                    this.beneficiaryTitle = d.beneficiaryTitle || '';
                    this.accountStatus = d.accountStatus || '';
                    this.beneficiaryBranchCode = d.beneficiaryBranchCode || '';
                    this.city = (d as any).city || 'Karachi';
                    this.depositSlipId = d.depositSlipId != null ? String(d.depositSlipId) : '';
                    this.cycle = (d as any).cycle || 'PECS-I';
                    this.chequeNumber = d.chequeNo || '';
                    this.payingBankCode = d.payingBankCode || '';
                    this.payingBranchCode = d.payingBranchCode || '';
                    this.amount = d.amount || null;
                    this.chequeDate = d.chequeDate || '';
                    this.instrumentType = d.instrumentType || '';
                    this.micrCode = d.micr || '';
                    this.currency = d.currency ? `${d.currency} - Pak Rupee` : 'PKR - Pak Rupee';
                    this.remarks = d.remarks || '';
                    this.receiverBranchCode = d.receiverBranchCode || '';
                    this.scanOcrEngine = d.ocrEngine || '';
                    this.scanProcessingTime = d.processingTime || '';
                    this.scanAccuracy = d.accuracy || '';
                    this.scanAmountInWords = d.amountInWords || '';
                    this.scanFrontImage = '';
                    this.scanBackImage = '';
                    this.scanUvImage = '';
                    this.chequeInfoService.getChequeImageDataUri(d.imageF || '').subscribe(src => this.scanFrontImage = src);
                    this.chequeInfoService.getChequeImageDataUri(d.imageB || '').subscribe(src => this.scanBackImage = src);
                    this.chequeInfoService.getChequeImageDataUri(d.imageU || '').subscribe(src => this.scanUvImage = src);
                    this.scanMicrOcr = (d as any).micrOcr || '';
                    this.micrMatch = null;
                    this.micrStatusOverride = {};
                    this.scanStatus = 'Ready for Review';
                    this.hasScanned = true;
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    Swal.fire({ icon: 'error', title: 'Load Failed', text: response?.errorMessage || 'Unable to load instrument.' });
                }
            },
            error: (err) => {
                this.isLoadingInstrument = false;
                Swal.fire({ icon: 'error', title: 'Load Failed', text: err?.error?.errorMessage || 'Unable to load instrument.' });
            }
        });
    }

    onDeleteInstrument(instrumentId: number): void {
        if (!instrumentId || this.isLoadingInstrument) return;
        Swal.fire({
            title: 'Are you sure?',
            text: 'This instrument will be deleted permanently.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                this.isLoadingInstrument = true;
                this.chequeInfoService.deleteChequeInfo(instrumentId).subscribe({
                    next: (response) => {
                        this.isLoadingInstrument = false;
                        if (response.status === 'success' || response.statusCode === 200) {
                            this.instruments = this.instruments.filter(inst => inst.id !== instrumentId);
                            this.stats.captured = this.instruments.filter(i => i.status === 'Captured').length;
                            this.stats.validated = this.instruments.filter(i => i.status === 'Validated').length;
                            this.stats.exceptions = this.instruments.filter(i => i.status === 'Exception').length;
                            Swal.fire({ icon: 'success', title: 'Deleted', text: 'Instrument deleted successfully.', timer: 1500, showConfirmButton: false });
                        } else {
                            Swal.fire({ icon: 'error', title: 'Delete Failed', text: response?.errorMessage || 'Unable to delete instrument.' });
                        }
                    },
                    error: (err) => {
                        this.isLoadingInstrument = false;
                        Swal.fire({ icon: 'error', title: 'Delete Failed', text: err?.error?.errorMessage || 'Unable to delete instrument.' });
                    }
                });
            }
        });
    }

    onDepositorTypeChange(): void {
        // All fields stay visible and keep their values for every depositor type.
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
        if (this.isScanning) return;
        const branchOptions = this.branches
            .map(b => `<option value="${b.code}">${b.code} - ${b.name}</option>`)
            .join('');
        const fieldStyle = 'width:100%;padding:8px 10px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;box-sizing:border-box;';
        const labelStyle = 'display:block;font-size:11px;font-weight:600;color:#6b7280;margin:10px 0 4px;text-transform:uppercase;';
        Swal.fire({
            title: 'Deposit Slip Details',
            width: 420,
            html: `
                <div style="text-align:left;">
                    <label style="${labelStyle}">Account</label>
                    <input id="slip-account" type="text" class="swal2-input" style="${fieldStyle}margin:0;" placeholder="Enter account number"/>
                    <label style="${labelStyle}">Cheque No</label>
                    <input id="slip-cheque" type="text" class="swal2-input" style="${fieldStyle}margin:0;" placeholder="Enter cheque number"/>
                    <label style="${labelStyle}">Branch</label>
                    <select id="slip-branch" class="swal2-input" style="${fieldStyle}margin:0;">
                        <option value="">Select Branch</option>
                        ${branchOptions}
                    </select>
                    <label style="${labelStyle}">Amount</label>
                    <input id="slip-amount" type="number" class="swal2-input" style="${fieldStyle}margin:0;" placeholder="0.00" min="0" step="0.01"/>
                </div>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Start Scan',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#5a2181',
            preConfirm: () => {
                const account = (document.getElementById('slip-account') as HTMLInputElement).value.trim();
                const chequeNo = (document.getElementById('slip-cheque') as HTMLInputElement).value.trim();
                const branch = (document.getElementById('slip-branch') as HTMLSelectElement).value;
                const amount = (document.getElementById('slip-amount') as HTMLInputElement).value;
                return { account, chequeNo, branch, amount: amount ? Number(amount) : null };
            }
        }).then(result => {
            if (!result.isConfirmed || !result.value) return;
            const v = result.value;
            if (v.account) { this.beneficiaryAccount = v.account; this.accountNumber = v.account; }
            if (v.chequeNo) this.chequeNumber = v.chequeNo;
            if (v.branch) this.payingBranchCode = v.branch;
            if (v.amount != null) this.amount = v.amount;
            this.micrStatusOverride = {};
            this.performScan();
        });
    }

    readonly visualCheckItems = [
        'Original CBS Paper', 'Cheque Date Valid', 'Beneficiary Eligible', 'Amount Matched',
        'Signature Present', 'Signature Handwritten', 'Cheque Unaltered'
    ];
    visualCheckResults: Record<string, 'yes' | 'no' | 'none'> = {};

    onVisualChecks(): void {
        const col = (items: string[]) => `<div class="vc-col">${items.map(label => `
            <div class="vc-row" data-key="${label}" data-selected="yes">
                <span class="vc-label">${label}</span>
                <span class="vc-toggle">
                    <button type="button" data-val="yes" class="vc-btn vc-btn--yes vc-on">Yes</button>
                    <button type="button" data-val="no" class="vc-btn vc-btn--no">No</button>
                </span>
            </div>`).join('')}</div>`;
        Swal.fire({
            title: 'Visual Checks',
            width: 700,
            customClass: { popup: 'vc-popup', title: 'vc-title', confirmButton: 'vc-confirm', cancelButton: 'vc-cancel' },
            html: `
                <style>
                    .vc-title { font-size:16px; font-weight:700; color:#111827; padding-top:18px; }
                    .vc-popup { border-radius:14px; }
                    .vc-head { display:flex; justify-content:flex-end; padding:0 4px 10px; border-bottom:1px solid #e5e7eb; margin-bottom:6px; }
                    .vc-accept { display:flex; align-items:center; gap:7px; font-size:12.5px; font-weight:600; color:#0d9488; cursor:pointer; user-select:none; }
                    .vc-accept input { accent-color:#0d9488; width:15px; height:15px; cursor:pointer; }
                    .vc-cols { display:flex; gap:32px; text-align:left; padding:0 4px; }
                    .vc-col { flex:1; }
                    .vc-row { display:flex; align-items:center; justify-content:space-between; padding:9px 2px; border-bottom:1px dashed #eef2f7; }
                    .vc-label { font-size:13px; font-weight:600; color:#374151; white-space:nowrap; }
                    .vc-label::after { content:' *'; color:#dc2626; }
                    .vc-toggle { display:flex; gap:6px; flex-shrink:0; }
                    .vc-btn { min-width:52px; }
                    .vc-btn { border:none; border-radius:6px; padding:5px 14px; font-size:11.5px; font-weight:700; cursor:pointer; background:#f1f5f9; color:#94a3b8; transition:all .15s; }
                    .vc-btn:hover:not(.vc-on) { background:#e2e8f0; }
                    .vc-btn--yes.vc-on { background:#0d9488; color:#fff; box-shadow:0 1px 3px rgba(13,148,136,.35); }
                    .vc-btn--no.vc-on  { background:#dc2626; color:#fff; box-shadow:0 1px 3px rgba(220,38,38,.35); }
                    .vc-confirm { border-radius:8px; font-weight:600; }
                    .vc-cancel  { border-radius:8px; font-weight:600; }
                </style>
                <div class="vc-head">
                    <label class="vc-accept"><input id="vc-accept-all" type="checkbox" checked/> Accept All</label>
                </div>
                <div class="vc-cols">
                    ${col(this.visualCheckItems.slice(0, 4))}
                    ${col(this.visualCheckItems.slice(4))}
                </div>`,
            showCancelButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: '#5a2181',
            didOpen: () => {
                const popup = Swal.getPopup()!;
                const setRow = (r: HTMLElement, val: 'yes' | 'no' | 'none') => {
                    r.setAttribute('data-selected', val);
                    r.querySelectorAll<HTMLButtonElement>('.vc-btn').forEach(b =>
                        b.classList.toggle('vc-on', b.getAttribute('data-val') === val));
                };
                popup.querySelectorAll<HTMLElement>('.vc-row').forEach(r =>
                    r.querySelectorAll<HTMLButtonElement>('.vc-btn').forEach(b =>
                        b.addEventListener('click', () => setRow(r, b.getAttribute('data-val') as 'yes' | 'no'))));
                popup.querySelector('#vc-accept-all')?.addEventListener('change', e => {
                    const checked = (e.target as HTMLInputElement).checked;
                    popup.querySelectorAll<HTMLElement>('.vc-row').forEach(r => setRow(r, checked ? 'yes' : 'none'));
                });
            },
            preConfirm: () => {
                const results: Record<string, 'yes' | 'no' | 'none'> = {};
                Swal.getPopup()!.querySelectorAll<HTMLElement>('.vc-row').forEach(r =>
                    results[r.getAttribute('data-key')!] = r.getAttribute('data-selected') as 'yes' | 'no' | 'none');
                return results;
            }
        }).then(result => {
            if (result.isConfirmed && result.value) this.visualCheckResults = result.value;
        });
    }

    private performScan(): void {
        this.isScanning = true;
        this.chequeScannerService.scanBatch(this.batchId).subscribe({
            next: (result) => {
                this.isScanning = false;
                this.scannedCheques = result.cheques;
                this.scanSource = result.source;
                this.activeScanIndex = 0;
                if (result.cheques.length > 0) {
                    this.applyScannedCheque(result.cheques[0]);
                } else {
                    Swal.fire({ icon: 'info', title: 'No Cheques', text: 'The scanner returned no instruments.' });
                    return;
                }
                const fraudCount = result.cheques.filter(c => c.micrMatch === false).length;
                if (fraudCount > 0) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'MICR Mismatch Detected',
                        text: `${fraudCount} of ${result.cheques.length} scanned cheque(s) failed MICR / MICR-OCR verification and may be fraudulent.`
                    });
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: 'Scan Complete',
                        text: `${result.cheques.length} cheque(s) scanned and verified.`,
                        timer: 1800,
                        showConfirmButton: false
                    });
                }
            },
            error: (err) => {
                this.isScanning = false;
                console.error('Scanner error:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Scan Failed',
                    text: 'Unable to communicate with the scanner device. Please check that the device is connected and the scanner service is running.'
                });
            }
        });
    }

    selectScannedCheque(index: number): void {
        if (index < 0 || index >= this.scannedCheques.length) return;
        this.activeScanIndex = index;
        this.applyScannedCheque(this.scannedCheques[index]);
    }

    private applyScannedCheque(cheque: NormalizedScannedCheque): void {
        this.chequeView = 'front';
        this.resetAllScanSettings();
        this.scanFrontImage = cheque.frontImage;
        this.scanBackImage = cheque.backImage;
        this.scanUvImage = cheque.uvImage;
        this.micrCode = cheque.micr;
        this.scanMicrOcr = cheque.micrOcr;
        this.micrMatch = cheque.micrMatch;
        // Pre-fill User Input from the MICR line only where the slip modal left it empty
        const parts = this.parseMicr(cheque.micr || cheque.micrOcr);
        if (parts.chequeNo && !this.chequeNumber) this.chequeNumber = parts.chequeNo;
        if (parts.bankBranch && !this.bankBranchInput) this.bankBranchInput = parts.bankBranch;
        if (parts.accountNo && !this.accountNumber) this.accountNumber = parts.accountNo;
        this.micrStatusOverride = {};
        this.instrumentType = this.instrumentType || 'Cheque';
        this.scanOcrEngine = 'Bancor Scanner';
        this.scanStatus = cheque.micrMatch === false ? 'MICR Mismatch' : 'Ready for Review';
        this.hasScanned = true;
    }

    // ── MICR verification grid ────────────────────────────────────────────

    /**
     * Splits a MICR code line, e.g. "<61807824<0890103:0001030107104945<000=":
     *   61807824          -> cheque number
     *   0890103           -> bank (089) - branch (0103)
     *   0001030107104945  -> account number (last 14 digits: 01030107104945)
     */
    parseMicr(line: string): MicrParts {
        const segments = (line || '').split(/[^0-9]+/).filter(Boolean);
        const bankBranch = segments[1] || '';
        const account = segments[2] || '';
        return {
            chequeNo: segments[0] || '',
            bankBranch: bankBranch.length > 3 ? `${bankBranch.slice(0, 3)}-${bankBranch.slice(3)}` : bankBranch,
            accountNo: account.length > 14 ? account.slice(-14) : account
        };
    }

    get micrParts(): MicrParts {
        return this.parseMicr(this.micrCode);
    }

    get ocrParts(): MicrParts {
        return this.parseMicr(this.scanMicrOcr);
    }

    /** Bank - Branch user input, backed by the drawer bank / branch codes that are saved. */
    get bankBranchInput(): string {
        return [this.payingBankCode, this.payingBranchCode].filter(Boolean).join('-');
    }

    set bankBranchInput(value: string) {
        const [bank, ...branch] = (value || '').split('-');
        this.payingBankCode = (bank || '').trim();
        this.payingBranchCode = branch.join('-').trim();
    }

    getMicrValue(key: MicrRowKey): string {
        return key === 'amount' ? '' : this.micrParts[key];
    }

    getOcrValue(key: MicrRowKey): string {
        return key === 'amount' ? this.scanAmountInWords : this.ocrParts[key];
    }

    getUserInput(key: MicrRowKey): string {
        switch (key) {
            case 'chequeNo': return this.chequeNumber;
            case 'bankBranch': return this.bankBranchInput;
            case 'accountNo': return this.accountNumber;
            case 'amount': return this.amount != null ? String(this.amount) : '';
        }
    }

    setUserInput(key: MicrRowKey, value: string): void {
        switch (key) {
            case 'chequeNo': this.chequeNumber = value; break;
            case 'bankBranch': this.bankBranchInput = value; break;
            case 'accountNo': this.accountNumber = value; break;
            case 'amount': this.amount = value === '' || value == null ? null : Number(value); break;
        }
        // Editing the input re-evaluates the row automatically
        delete this.micrStatusOverride[key];
    }

    getMicrRowStatus(key: MicrRowKey): MicrRowStatus {
        const override = this.micrStatusOverride[key];
        if (override) return override === 'none' ? null : override;
        const reference = this.getMicrValue(key);
        const input = this.getUserInput(key);
        if (!reference || !input) return null;
        return this.normalizeMicrCompare(reference) === this.normalizeMicrCompare(input) ? 'matched' : 'notMatched';
    }

    /** Matched / Not Matched are mutually exclusive; unchecking leaves the row unverified. */
    setMicrRowStatus(key: MicrRowKey, status: 'matched' | 'notMatched', checked: boolean): void {
        this.micrStatusOverride = { ...this.micrStatusOverride, [key]: checked ? status : 'none' };
    }

    /** Used to keep MICR-derived codes selectable even if they're missing from the lookup lists. */
    hasBank(code: string): boolean {
        return this.banks.some(b => b.value === code);
    }

    hasBranch(code: string): boolean {
        return this.branches.some(br => br.code === code);
    }

    private normalizeMicrCompare(value: string): string {
        return (value || '').replace(/[\s-]/g, '');
    }

    // ── Scan image viewer (same controls as Cheque Details page) ──────────

    selectScanView(view: 'front' | 'back' | 'Ultra'): void {
        this.chequeView = view;
    }

    zoomScanIn(): void {
        if (this.scanZoom < 3) this.scanZoom += 0.25;
    }

    zoomScanOut(): void {
        if (this.scanZoom > 0.5) this.scanZoom -= 0.25;
    }

    resetScanZoom(): void {
        this.scanZoom = 1;
    }

    rotateScanLeft(): void {
        this.scanRotation -= 90;
    }

    rotateScanRight(): void {
        this.scanRotation += 90;
    }

    resetScanRotation(): void {
        this.scanRotation = 0;
    }

    increaseScanBrightness(): void {
        if (this.scanBrightness < 200) this.scanBrightness += 10;
    }

    decreaseScanBrightness(): void {
        if (this.scanBrightness > 50) this.scanBrightness -= 10;
    }

    resetScanBrightness(): void {
        this.scanBrightness = 100;
    }

    increaseScanContrast(): void {
        if (this.scanContrast < 200) this.scanContrast += 10;
    }

    decreaseScanContrast(): void {
        if (this.scanContrast > 50) this.scanContrast -= 10;
    }

    resetScanContrast(): void {
        this.scanContrast = 100;
    }

    resetAllScanSettings(): void {
        this.scanZoom = 1;
        this.scanRotation = 0;
        this.scanBrightness = 100;
        this.scanContrast = 100;
        this.scanPanX = 0;
        this.scanPanY = 0;
        this.showScanMagnifier = false;
        this.isScanDragging = false;
    }

    getScanImageStyle(): Record<string, string> {
        return {
            transform: `translate(${this.scanPanX}px, ${this.scanPanY}px) scale(${this.scanZoom}) rotate(${this.scanRotation}deg)`,
            filter: `brightness(${this.scanBrightness}%) contrast(${this.scanContrast}%)`
        };
    }

    onScanMouseDown(event: MouseEvent): void {
        if (this.scanZoom > 1) {
            this.isScanDragging = true;
            this.scanDragStartX = event.clientX - this.scanPanX;
            this.scanDragStartY = event.clientY - this.scanPanY;
            event.preventDefault();
        }
    }

    onScanMouseMove(event: MouseEvent): void {
        if (this.scanZoom === 1) {
            const target = event.target as HTMLElement;
            const rect = target.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            this.scanMagnifierX = x - 100;
            this.scanMagnifierY = y - 100;
            this.scanMagnifierBgPosition = `${(x / rect.width) * 100}% ${(y / rect.height) * 100}%`;
            this.showScanMagnifier = true;
        } else if (this.isScanDragging && this.scanZoom > 1) {
            this.scanPanX = event.clientX - this.scanDragStartX;
            this.scanPanY = event.clientY - this.scanDragStartY;
        }
    }

    onScanMouseUp(): void {
        this.isScanDragging = false;
    }

    onScanMouseLeave(): void {
        this.isScanDragging = false;
        this.showScanMagnifier = false;
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
            imageF: this.scanFrontImage || '',
            imageB: this.scanBackImage || '',
            imageU: this.scanUvImage || '',
            currency: (this.currency || '').split(' ')[0] || 'PKR',
            remarks: this.remarks || '',
            receiverBranchCode: this.receiverBranchCode || '',
            branchName: '',
            drawerBank: this.payingBankCode || '',
            amountInWords: this.scanAmountInWords || '',
            referenceNo: '',
            depositSlipId: Number(this.depositSlipId) || 0,
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
        (payload as any).micrOcr = this.scanMicrOcr || '';
        (payload as any).city = this.city || '';
        (payload as any).cycle = this.cycle || '';

        this.isSaving = true;

        if (this.editingInstrumentId) {
            payload.id = this.editingInstrumentId;
            this.chequeInfoService.updateChequeInfo(this.editingInstrumentId, payload).subscribe({
                next: (response: any) => {
                    this.isSaving = false;
                    if (response?.status === 'success' || response?.statusCode === 200) {
                        const updatedId = this.editingInstrumentId!;
                        this.updateInstrumentInList(updatedId, payload);
                        Swal.fire({ icon: 'success', title: 'Updated', text: 'Instrument updated successfully.', timer: 1500, showConfirmButton: false });
                        this.clearForm();
                        this.hasScanned = false;
                    } else {
                        Swal.fire({ icon: 'error', title: 'Update failed', text: response?.errorMessage || 'Unable to update instrument.' });
                    }
                },
                error: (err) => {
                    this.isSaving = false;
                    Swal.fire({ icon: 'error', title: 'Update failed', text: err?.error?.errorMessage || 'Unable to update instrument.' });
                }
            });
            return;
        }

        this.chequeInfoService.createChequeInfo(payload).subscribe({
            next: (response: any) => {
                this.isSaving = false;
                const saved = response?.data;
                if ((response?.status === 'success' || response?.statusCode === 201) && saved) {
                    this.appendInstrumentFromResponse({ ...payload, ...saved });
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

    private updateInstrumentInList(id: number, data: any): void {
        this.instruments = this.instruments.map(inst => {
            if (inst.id === id) {
                return {
                    ...inst,
                    chequeNo: data.chequeNo || '',
                    accountNo: data.accountNo || '',
                    draweeBank: data.drawerBank || data.payingBankCode || 'N/A',
                    city: data.city || inst.city,
                    depositSlipId: data.depositSlipId != null ? String(data.depositSlipId) : inst.depositSlipId,
                    cycle: data.cycle || inst.cycle,
                    amount: Number(data.amount) || 0
                };
            }
            return inst;
        });
    }

    private appendInstrumentFromResponse(data: any): void {
        const item: BatchInstrumentItem = {
            id: data.id || 0,
            sNo: this.instruments.length + 1,
            chequeNo: data.chequeNo || '',
            accountNo: data.accountNo || '',
            drawerBankName: data.drawerBankName || 'N/A',
            draweeBank: data.drawerBank || data.payingBankCode || 'N/A',
            city: data.city || '',
            depositSlipId: data.depositSlipId != null ? String(data.depositSlipId) : '',
            cycle: data.cycle || '',
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
        this.cnic = '';
        this.beneficiaryAccount = '';
        this.beneficiaryTitle = '';
        this.payingBankCode = '';
        this.payingBranchCode = '';
        this.accountStatus = '';
        this.beneficiaryBranchCode = '';
        this.receiverBranchCode = '';
        this.city = 'Karachi';
        this.depositSlipId = '';
        this.cycle = 'PECS-I';
        this.instrumentType = '';
        this.amount = null;
        this.chequeDate = new Date().toISOString().slice(0, 10);
        this.remarks = '';
        this.micrCode = '';
        this.editingInstrumentId = null;
        this.scanFrontImage = '';
        this.scanBackImage = '';
        this.scanUvImage = '';
        this.scanMicrOcr = '';
        this.scanAmountInWords = '';
        this.micrMatch = null;
        this.micrStatusOverride = {};
        this.scanStatus = 'Pending';
        this.chequeView = 'front';
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
