import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { NiftReconciliationService, NiftApiRecord, NiftUploadData } from '../../services/nift-reconciliation.service';


@Component({
    selector: 'app-nift-reconciliation',
    imports: [CommonModule, FormsModule],
    providers: [NiftReconciliationService],
    templateUrl: './nift-reconciliation.component.html',
    styleUrl: './nift-reconciliation.component.scss'
})
export class NiftReconciliationComponent implements OnInit {

    constructor(private niftService: NiftReconciliationService) {}

    ngOnInit(): void {
        this.loadReconcileList();
    }

    private loadReconcileList(): void {
        this.isLoading = true;
        this.niftService.getReconcileList().subscribe({
            next: (res) => {
                this.isLoading = false;
                if ((res.statusCode === 200 || res.status?.toLowerCase() === 'success') && res.data) {
                    this.populateFromResponse(res.data);
                }
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    private populateFromResponse(d: NiftUploadData): void {
        this.unmatchedRecords = d.unmatchedRecords;
        this.matchedRecords   = d.matchedRecords;
        this.stats = {
            totalLodgments:  d.summary.totalLodgement,
            autoMatched:     d.summary.matched,
            actionRequired:  d.summary.unmatched,
            reconciledValue: this.formatAmount(d.summary.totalAmount)
        };
    }

    activeTab: 'matched' | 'unmatched' = 'unmatched';
    searchQuery = '';
    selectedFileName = '';
    isLoading = false;
    isUploading = false;
    uploadSuccess = false;
    uploadError = '';

    stats = {
        totalLodgments: 0,
        autoMatched: 0,
        actionRequired: 0,
        reconciledValue: '0'
    };

    unmatchedRecords: NiftApiRecord[] = [];
    matchedRecords: NiftApiRecord[] = [];

    get filteredUnmatched(): NiftApiRecord[] {
        const q = this.searchQuery.trim().toLowerCase();
        if (!q) return this.unmatchedRecords;
        return this.unmatchedRecords.filter(r =>
            r.chequeNo.toLowerCase().includes(q) ||
            r.branchName.toLowerCase().includes(q)
        );
    }

    get filteredMatched(): NiftApiRecord[] {
        const q = this.searchQuery.trim().toLowerCase();
        if (!q) return this.matchedRecords;
        return this.matchedRecords.filter(r =>
            r.chequeNo.toLowerCase().includes(q) ||
            r.branchName.toLowerCase().includes(q)
        );
    }

    setTab(tab: 'matched' | 'unmatched'): void {
        this.activeTab = tab;
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        const file = input.files[0];
        this.selectedFileName = file.name;
        this.uploadError = '';
        this.uploadSuccess = false;
        this.isUploading = true;

        this.niftService.uploadNiftFile(file).subscribe({
            next: (res) => {
                this.isUploading = false;
                if ((res.statusCode === 200 || res.status?.toLowerCase() === 'success') && res.data) {
                    this.uploadSuccess = true;
                    this.populateFromResponse(res.data);
                    Swal.fire({
                        icon: 'success',
                        title: 'File Uploaded',
                        text: `Matched: ${res.data.summary.matched}  |  Unmatched: ${res.data.summary.unmatched}`,
                        timer: 2500,
                        showConfirmButton: false
                    });
                } else {
                    this.uploadError = res.errorMessage ?? 'Upload failed.';
                    Swal.fire({ icon: 'error', title: 'Upload Failed', text: this.uploadError });
                }
                input.value = '';
            },
            error: (err) => {
                this.isUploading = false;
                this.uploadError = err?.error?.errorMessage ?? err?.message ?? 'Upload failed. Please try again.';
                Swal.fire({ icon: 'error', title: 'Upload Failed', text: this.uploadError });
                input.value = '';
            }
        });
    }

    onForceMatch(record: NiftApiRecord): void {
        this.niftService.forceMatch(record.niftStagingId, record.chequeNo).subscribe({
            next: (res) => {
                if (res.statusCode === 200 || res.status?.toLowerCase() === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Force Matched',
                        text: `Cheque ${record.chequeNo} has been force matched successfully.`,
                        timer: 2000,
                        showConfirmButton: false
                    });
                    this.loadReconcileList();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Force Match Failed',
                        text: res.errorMessage || 'Unable to force match the cheque.'
                    });
                }
            },
            error: (err) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Force Match Failed',
                    text: err?.error?.errorMessage || err?.message || 'Unable to force match the cheque. Please try again.'
                });
            }
        });
    }




    formatAmount(val: number): string {
        return val.toLocaleString('en-PK');
    }
}
