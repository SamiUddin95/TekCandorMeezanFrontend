import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterService, BranchItem, BranchFilterResponse } from '@app/services/filter.service';
import { GenerateClearingFileService } from '../../services/generate-clearing-file.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-generate-clearing-file',
    imports: [CommonModule, FormsModule],
    templateUrl: './generate-clearing-file.component.html',
    styleUrl: './generate-clearing-file.component.scss'
})
export class GenerateClearingFileComponent implements OnInit {

    businessDate: string = '';
    selectedBranch = 'all';
    dateMode: 'today' | 'yesterday' = 'today';
    isGenerating = false;
    isLoadingBranches = false;
    lastUpdated = 'Just now';

    branches: { code: string; label: string }[] = [{ code: 'all', label: 'All Branches (Global)' }];

    summary = {
        totalInstruments: 1234,
        totalSettledAmount: 12345678.90,
        currency: 'USD',
        validationPassed: true
    };

    constructor(
        private filterService: FilterService,
        private generateClearingFileService: GenerateClearingFileService
    ) { }

    ngOnInit(): void {
        this.setDate('today');
        this.loadBranches();
    }

    private loadBranches(): void {
        this.isLoadingBranches = true;
        this.filterService.getBranches().subscribe({
            next: (response: BranchFilterResponse) => {
                this.isLoadingBranches = false;
                const apiBranches: { code: string; label: string }[] =
                    (response?.data?.branches || []).map((b: BranchItem) => ({
                        code: b.code,
                        label: b.name
                    }));
                this.branches = [
                    { code: 'all', label: 'All Branches (Global)' },
                    ...apiBranches
                ];
            },
            error: () => {
                this.isLoadingBranches = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Load Failed',
                    text: 'Unable to load branch list.',
                    confirmButtonColor: '#5a2181'
                });
            }
        });
    }

    setDate(mode: 'today' | 'yesterday'): void {
        this.dateMode = mode;
        const d = new Date();
        if (mode === 'yesterday') {
            d.setDate(d.getDate() - 1);
        }
        this.businessDate = d.toISOString().split('T')[0];
        this.refreshSummary();
    }

    onBranchChange(): void {
        this.refreshSummary();
    }

    onDateChange(): void {
        this.dateMode = 'today';
        this.refreshSummary();
    }

    private refreshSummary(): void {
        this.lastUpdated = 'Just now';
    }

    onResetFilters(): void {
        this.setDate('today');
        this.selectedBranch = 'all';
    }

    onGenerate(): void {
        if (this.isGenerating) return;
        Swal.fire({
            title: 'Generate Clearing File?',
            html: `This will generate the clearing file for <strong>${this.formatDate(this.businessDate)}</strong>.<br/>Branch: <strong>${this.getBranchLabel()}</strong>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#5a2181',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Generate',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                this.isGenerating = true;
                this.generateClearingFileService.generateClearingFile(this.selectedBranch, this.businessDate).subscribe({
                    next: (blob: Blob) => {
                        this.isGenerating = false;
                        this.downloadFile(blob, `ChequeInfo_${this.selectedBranch}_${this.formatDateForFileName(this.businessDate)}.txt`);
                        Swal.fire({
                            icon: 'success',
                            title: 'File Downloaded',
                            text: 'Clearing file has been downloaded successfully.',
                            confirmButtonColor: '#5a2181',
                            timer: 2500,
                            timerProgressBar: true
                        });
                    },
                    error: (err) => {
                        this.isGenerating = false;
                        Swal.fire({
                            icon: 'error',
                            title: 'Download Failed',
                            text: 'Unable to download clearing file. Please try again.',
                            confirmButtonColor: '#5a2181'
                        });
                    }
                });
            }
        });
    }

    getBranchLabel(): string {
        return this.branches.find(b => b.code === this.selectedBranch)?.label || 'All Branches (Global)';
    }

    formatAmount(val: number): string {
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    formatDate(dateStr: string): string {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    formatDateForFileName(dateStr: string): string {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    }

    private downloadFile(blob: Blob, fileName: string): void {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}
