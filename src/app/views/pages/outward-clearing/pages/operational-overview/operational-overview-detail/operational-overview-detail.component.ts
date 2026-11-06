import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '@app/components/spinner/spinner.component';
import { NgIcon } from '@ng-icons/core';
import { OperationalOverviewService, ChequeDetailItem } from '../../../services/operational-overview.service';
import { ChequeInfoService } from '../../../services/cheque-info.service';
import Swal from 'sweetalert2';

type MicrRowKey = 'chequeNo' | 'bankBranch' | 'accountNo' | 'amount';
type MicrRowStatus = 'matched' | 'notMatched' | null;

interface MicrParts {
    chequeNo: string;
    bankBranch: string;
    accountNo: string;
}

@Component({
    selector: 'app-oo-detail',
    imports: [CommonModule, SpinnerComponent, NgIcon],
    templateUrl: './operational-overview-detail.component.html',
    styleUrls: [
        './operational-overview-detail.component.scss',
        '../../batch-management/batch-management-new/batch-management-new.component.scss'
    ]
})
export class OperationalOverviewDetailComponent implements OnInit, OnChanges {

    @Input() chequeId!: number;
    @Output() backClicked = new EventEmitter<void>();

    isLoading = false;
    isActionLoading = false;
    loadError = '';
    detailItem: ChequeDetailItem | null = null;

    // ── Scanned cheque images (resolved from stored file names) ──
    scanFrontImage = '';
    scanBackImage = '';
    scanUvImage = '';
    chequeView: 'front' | 'back' | 'Ultra' = 'front';

    // ── Verification data ──
    micrCode = '';
    scanMicrOcr = '';
    micrMatch: boolean | null = null;
    scanOcrEngine = '—';
    scanProcessingTime = '—';
    scanAccuracy = '—';
    scanAmountInWords = '';
    chequeNumber = '';
    accountNumber = '';
    payingBankCode = '';
    payingBranchCode = '';
    amount: number | null = null;
    beneficiaryTitle = '';
    scanStatus = '';

    // ── MICR verification grid (read-only mirror of the entry page) ──
    readonly micrRows: { key: MicrRowKey; label: string }[] = [
        { key: 'chequeNo', label: 'Cheque Number' },
        { key: 'bankBranch', label: 'Bank - Branch' },
        { key: 'accountNo', label: 'Account Number' },
        { key: 'amount', label: 'Amount' }
    ];

    // ── Cheque Analytics tabs (same as entry page) ──
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

    // ── Scan image viewer state (same controls as the entry page) ──
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

    constructor(
        private service: OperationalOverviewService,
        private chequeInfoService: ChequeInfoService
    ) { }

    ngOnInit(): void {
        this.loadDetail();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['chequeId'] && !changes['chequeId'].firstChange) {
            this.loadDetail();
        }
    }

    get hasImages(): boolean {
        return !!(this.scanFrontImage || this.scanBackImage || this.scanUvImage);
    }

    get activeScanImage(): string {
        if (this.chequeView === 'front') return this.scanFrontImage;
        if (this.chequeView === 'back') return this.scanBackImage;
        return this.scanUvImage;
    }

    private loadDetail(): void {
        if (!this.chequeId) return;
        this.isLoading = true;
        this.loadError = '';
        this.detailItem = null;
        this.resetViewState();
        this.service.getById(this.chequeId).subscribe({
            next: (response) => {
                this.isLoading = false;
                this.detailItem = response?.data || null;
                if (this.detailItem) this.applyDetail(this.detailItem);
            },
            error: () => {
                this.isLoading = false;
                this.loadError = 'Unable to load transaction details.';
            }
        });
    }

    private applyDetail(d: ChequeDetailItem): void {
        this.chequeNumber = d.chequeNo || '';
        this.accountNumber = d.accountNo || '';
        this.payingBankCode = d.payingBankCode || '';
        this.payingBranchCode = d.payingBranchCode || '';
        this.amount = d.amount ?? null;
        this.beneficiaryTitle = d.beneficiaryTitle || '';
        this.micrCode = d.micr || '';
        this.scanMicrOcr = d.micr || '';
        this.micrMatch = this.micrCode ? true : null;
        this.scanOcrEngine = d.ocrEngine || '—';
        this.scanProcessingTime = d.processingTime || '—';
        this.scanAccuracy = d.accuracy || '—';
        this.scanAmountInWords = d.amountInWords || '';
        this.scanStatus = this.mapStatus(d.status);

        this.chequeInfoService.getChequeImageDataUri(d.imageF || '').subscribe(src => this.scanFrontImage = src);
        this.chequeInfoService.getChequeImageDataUri(d.imageB || '').subscribe(src => this.scanBackImage = src);
        this.chequeInfoService.getChequeImageDataUri(d.imageU || '').subscribe(src => this.scanUvImage = src);
    }

    private resetViewState(): void {
        this.scanFrontImage = '';
        this.scanBackImage = '';
        this.scanUvImage = '';
        this.chequeView = 'front';
        this.resetAllScanSettings();
    }

    onBack(): void {
        this.backClicked.emit();
    }

    onAuthorizeInstrument(): void {
        if (this.isActionLoading) return;

        const id = this.detailItem?.id || this.chequeId;
        if (!id) return;

        Swal.fire({
            title: 'Authorize Cheque',
            text: `Authorize cheque ${this.detailItem?.chequeNo || id}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Authorize',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#198754'
        }).then(result => {
            if (!result.isConfirmed) return;
            this.isActionLoading = true;
            this.service.approveCheque(id).subscribe({
                next: (response) => {
                    this.isActionLoading = false;
                    Swal.fire({
                        icon: 'success',
                        title: 'Authorized',
                        text: response?.data || 'Cheque authorized successfully',
                        timer: 1800,
                        showConfirmButton: false
                    });
                    this.onBack();
                },
                error: () => {
                    this.isActionLoading = false;
                    Swal.fire({
                        icon: 'error',
                        title: 'Authorization Failed',
                        text: 'Unable to authorize cheque.'
                    });
                }
            });
        });
    }

    onRejectInstrument(): void {
        if (this.isActionLoading) return;

        const id = this.detailItem?.id || this.chequeId;
        if (!id) return;

        Swal.fire({
            title: 'Reject Cheque',
            text: 'You can add an optional rejection reason.',
            input: 'textarea',
            inputLabel: 'Reason (Optional)',
            inputPlaceholder: 'Type reason here (optional)...',
            inputAttributes: { maxlength: '300' },
            showCancelButton: true,
            confirmButtonText: 'Reject',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc2626'
        }).then(result => {
            if (!result.isConfirmed) return;
            const remarks = typeof result.value === 'string' ? result.value.trim() : '';
            this.isActionLoading = true;
            this.service.rejectCheque(id, remarks).subscribe({
                next: (response) => {
                    this.isActionLoading = false;
                    Swal.fire({
                        icon: 'success',
                        title: 'Rejected',
                        text: response?.data || 'Cheque rejected successfully',
                        timer: 1800,
                        showConfirmButton: false
                    });
                    this.onBack();
                },
                error: () => {
                    this.isActionLoading = false;
                    Swal.fire({
                        icon: 'error',
                        title: 'Rejection Failed',
                        text: 'Unable to reject cheque.'
                    });
                }
            });
        });
    }

    // ── MICR parsing / row evaluation (read-only) ──────────────────────────

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

    get bankBranchInput(): string {
        return [this.payingBankCode, this.payingBranchCode].filter(Boolean).join('-');
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

    getMicrRowStatus(key: MicrRowKey): MicrRowStatus {
        const reference = this.getMicrValue(key);
        const input = this.getUserInput(key);
        if (!reference || !input) return null;
        return this.normalizeMicrCompare(reference) === this.normalizeMicrCompare(input) ? 'matched' : 'notMatched';
    }

    private normalizeMicrCompare(value: string): string {
        return (value || '').replace(/[\s-]/g, '');
    }

    // ── Scan image viewer controls (same as Cheque Details / entry page) ──

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

    formatAmount(val: number): string {
        return (val || 0).toLocaleString('en-PK');
    }

    formatDate(dateStr: string | null | undefined): string {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return '—';
        return d.toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    }

    mapStatus(status: string): string {
        const map: Record<string, string> = {
            'P': 'Pending', 'RE': 'Returned', 'C': 'Cleared', 'A': 'Approved',
            'H': 'Priority', 'PR': 'Priority', 'CR': 'Critical'
        };
        return map[(status || '').toUpperCase()] || status || '—';
    }
}
