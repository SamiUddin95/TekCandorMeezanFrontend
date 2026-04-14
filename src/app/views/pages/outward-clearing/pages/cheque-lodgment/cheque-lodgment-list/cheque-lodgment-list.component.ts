import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface ChequeLodgmentItem {
    id: number;
    depositorName: string;
    accountNumber: string;
    beneficiaryName: string;
    amount: number;
    currency: string;
    status: string;
    date: string;
    trackingNumber: string;
}

@Component({
    selector: 'app-cheque-lodgment-list',
    imports: [CommonModule, FormsModule],
    templateUrl: './cheque-lodgment-list.component.html',
    styleUrl: './cheque-lodgment-list.component.scss'
})
export class ChequeLodgmentListComponent {

    searchTerm = '';
    filterStatus = '';

    mockData: ChequeLodgmentItem[] = [
        { id: 1, depositorName: 'Ahmed Raza', accountNumber: '0102-010244556', beneficiaryName: 'Siddique Trading Co.', amount: 150000, currency: 'PKR', status: 'Completed', date: '2026-04-14', trackingNumber: 'TRX-99283-MZB' },
        { id: 2, depositorName: 'Pakistan Textile Corp', accountNumber: '0102-910558490', beneficiaryName: 'Al-Baraka Textiles Pvt Ltd', amount: 450000, currency: 'PKR', status: 'Pending Review', date: '2026-04-14', trackingNumber: 'TRX-99284-MZB' },
        { id: 3, depositorName: 'Fatima Enterprises', accountNumber: '0102-776655443', beneficiaryName: 'Habib Bank Limited', amount: 275000, currency: 'PKR', status: 'Scanning', date: '2026-04-13', trackingNumber: 'TRX-99280-MZB' },
        { id: 4, depositorName: 'Ali Muhammad Khan', accountNumber: '0102-334455667', beneficiaryName: 'National Foods Ltd', amount: 89000, currency: 'PKR', status: 'Completed', date: '2026-04-13', trackingNumber: 'TRX-99278-MZB' },
        { id: 5, depositorName: 'Karachi Steel Works', accountNumber: '0102-112233445', beneficiaryName: 'Fauji Cement Co.', amount: 620000, currency: 'PKR', status: 'Draft', date: '2026-04-12', trackingNumber: 'TRX-99275-MZB' },
    ];

    constructor(private router: Router) {}

    get filteredData(): ChequeLodgmentItem[] {
        return this.mockData.filter(item => {
            const matchSearch = !this.searchTerm ||
                item.depositorName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                item.accountNumber.includes(this.searchTerm) ||
                item.trackingNumber.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchStatus = !this.filterStatus || item.status === this.filterStatus;
            return matchSearch && matchStatus;
        });
    }

    // getStatusClass(status: string): string {
    //     switch (status) {
    //         case 'Completed': return 'bg-success';
    //         case 'Pending Review': return 'bg-warning text-dark';
    //         case 'Scanning': return 'bg-info text-dark';
    //         case 'Draft': return 'bg-secondary';
    //         default: return '';
    //     }
    // }

    formatAmount(amount: number): string {
        return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    onAddNew(): void {
        this.router.navigate(['/pages/outward-clearing/cheque-lodgment/new']);
    }

    onView(item: ChequeLodgmentItem): void {
        this.router.navigate(['/pages/outward-clearing/cheque-lodgment/review', item.id]);
    }
}
