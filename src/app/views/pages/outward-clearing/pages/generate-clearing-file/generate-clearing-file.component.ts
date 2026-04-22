import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    FilterService,
    BranchItem,
    BranchFilterResponse,
    HubItem,
    HubFilterResponse,
    BranchInstrumentAmountResponse,
    HubInstrumentAmountResponse
} from '@app/services/filter.service';
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
    selectedHub = 'all';
    dateMode: 'today' | 'yesterday' = 'today';
    isGenerating = false;
    isLoadingBranches = false;
    isLoadingHubs = false;
    isLoadingSummary = false;
    lastUpdated = 'Just now';

    branches: { code: string; label: string }[] = [{ code: 'all', label: 'All Branches (Global)' }];
    hubs: { code: string; label: string }[] = [{ code: 'all', label: 'All Hubs' }];

    summary = {
        totalInstruments: 0,
        totalSettledAmount: 0,
        currency: 'PKR',
        validationPassed: true
    };

    constructor(
        private filterService: FilterService,
        private generateClearingFileService: GenerateClearingFileService
    ) { }

    ngOnInit(): void {
        this.setDate('today');
        this.loadBranches();
        this.loadHubs();
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

    private loadHubs(): void {
        this.isLoadingHubs = true;
        this.filterService.getHubs().subscribe({
            next: (response: HubFilterResponse) => {
                this.isLoadingHubs = false;
                const apiHubs: { code: string; label: string }[] =
                    (response?.data?.hubs || []).map((h: HubItem) => ({
                        code: h.code,
                        label: h.name
                    }));
                this.hubs = [
                    { code: 'all', label: 'All Hubs' },
                    ...apiHubs
                ];
            },
            error: () => {
                this.isLoadingHubs = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Load Failed',
                    text: 'Unable to load hub list.',
                    confirmButtonColor: '#5a2181'
                });
            }
        });
    }

    onBranchChange(): void {
        if (this.selectedBranch && this.selectedBranch !== 'all') {
            this.selectedHub = 'all';
            this.loadBranchSummary(this.selectedBranch);
        } else {
            this.refreshSummary();
        }
    }

    onHubChange(): void {
        if (this.selectedHub && this.selectedHub !== 'all') {
            this.selectedBranch = 'all';
            this.loadHubSummary(this.selectedHub);
        } else {
            this.refreshSummary();
        }
    }

    onDateChange(): void {
        this.dateMode = 'today';
        this.refreshSummary();
    }

    private loadBranchSummary(branchCode: string): void {
        this.isLoadingSummary = true;
        this.filterService.getBranchInstrumentAmount(branchCode).subscribe({
            next: (response: BranchInstrumentAmountResponse) => {
                this.isLoadingSummary = false;
                const data = response?.data;
                this.summary = {
                    ...this.summary,
                    totalInstruments: data?.totalInstrumentCount || 0,
                    totalSettledAmount: data?.totalAmount || 0
                };
                this.lastUpdated = 'Just now';
            },
            error: () => {
                this.isLoadingSummary = false;
                this.summary = { ...this.summary, totalInstruments: 0, totalSettledAmount: 0 };
            }
        });
    }

    private loadHubSummary(hubCode: string): void {
        this.isLoadingSummary = true;
        this.filterService.getHubInstrumentAmount(hubCode).subscribe({
            next: (response: HubInstrumentAmountResponse) => {
                this.isLoadingSummary = false;
                const data = response?.data;
                this.summary = {
                    ...this.summary,
                    totalInstruments: data?.totalInstrumentCount || 0,
                    totalSettledAmount: data?.totalAmount || 0
                };
                this.lastUpdated = 'Just now';
            },
            error: () => {
                this.isLoadingSummary = false;
                this.summary = { ...this.summary, totalInstruments: 0, totalSettledAmount: 0 };
            }
        });
    }

    private refreshSummary(): void {
        this.summary = { ...this.summary, totalInstruments: 0, totalSettledAmount: 0 };
        this.lastUpdated = 'Just now';
    }

    onResetFilters(): void {
        this.setDate('today');
        this.selectedBranch = 'all';
        this.selectedHub = 'all';
        this.refreshSummary();
    }

    get isBranchSelected(): boolean {
        return !!this.selectedBranch && this.selectedBranch !== 'all';
    }

    get isHubSelected(): boolean {
        return !!this.selectedHub && this.selectedHub !== 'all';
    }

    onGenerate(): void {
        if (this.isGenerating) return;

        const useHub = this.isHubSelected;
        const scopeLabel = useHub ? `Hub: <strong>${this.getHubLabel()}</strong>` : `Branch: <strong>${this.getBranchLabel()}</strong>`;

        Swal.fire({
            title: 'Generate Clearing File?',
            html: `This will generate the clearing file for <strong>${this.formatDate(this.businessDate)}</strong>.<br/>${scopeLabel}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#5a2181',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Generate',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (!result.isConfirmed) return;

            this.isGenerating = true;
            const request$ = useHub
                ? this.generateClearingFileService.generateClearingFileByHub(this.selectedHub, this.businessDate)
                : this.generateClearingFileService.generateClearingFile(this.selectedBranch, this.businessDate);

            const fileScope = useHub ? `Hub_${this.selectedHub}` : this.selectedBranch;
            const fileName = `ChequeInfo_${fileScope}_${this.formatDateForFileName(this.businessDate)}.txt`;

            request$.subscribe({
                next: (blob: Blob) => {
                    this.isGenerating = false;
                    this.downloadFile(blob, fileName);
                    Swal.fire({
                        icon: 'success',
                        title: 'File Downloaded',
                        text: 'Clearing file has been downloaded successfully.',
                        confirmButtonColor: '#5a2181',
                        timer: 2500,
                        timerProgressBar: true
                    });
                },
                error: () => {
                    this.isGenerating = false;
                    Swal.fire({
                        icon: 'error',
                        title: 'Download Failed',
                        text: 'Unable to download clearing file. Please try again.',
                        confirmButtonColor: '#5a2181'
                    });
                }
            });
        });
    }

    getBranchLabel(): string {
        return this.branches.find(b => b.code === this.selectedBranch)?.label || 'All Branches (Global)';
    }

    getHubLabel(): string {
        return this.hubs.find(h => h.code === this.selectedHub)?.label || 'All Hubs';
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
