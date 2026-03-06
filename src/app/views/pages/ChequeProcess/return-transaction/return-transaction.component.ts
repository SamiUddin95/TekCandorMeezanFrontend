import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Router } from '@angular/router';
import { ReturnTransactionService } from '../../../../services/return-transaction.service';
import { PaginationComponent } from '../../../../components/pagination/pagination.component';
import {
  tablerSearch,
  tablerCe,
  tablerRefresh,
  tablerDownload,
  tablerFileExport
} from '@ng-icons/tabler-icons';

@Component({
  selector: 'app-return-transaction',
  templateUrl: './return-transaction.component.html',
  styleUrls: ['./return-transaction.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, PaginationComponent],
  providers: [provideIcons({ tablerSearch, tablerCe, tablerRefresh, tablerDownload, tablerFileExport })]
})
export class ReturnTransactionComponent implements OnInit {

  // Filter variables
  selectedBranch: string = '';
  accountNumber: string = '';
  chequeNumber: string = '';
  selectedHub: string = '';
  selectedResCore: string = '';
  selectedStatus: string = '';
  selectedInstrument: string = '';
  selectedCycle: string = '';

  // Data variables
  returnTransactions: any[] = [];
  isLoading: boolean = false;

  // Pagination variables
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;

  // Dropdown data
  branches: any[] = [];
  hubs: any[] = [];
  statusOptions: any[] = [];
  instrumentOptions: any[] = [];
  cycleOptions: any[] = [];
  resCoreOptions: any[] = [];
  returnReasonOptions: any[] = [];

  constructor(
    private router: Router,
    private returnTransactionService: ReturnTransactionService
  ) { }

  ngOnInit(): void {
    this.loadDropdownData();
    this.loadReturnTransactions();
  }

  loadDropdownData(): void {
    // Load branches, hubs, and other dropdown data
    this.returnTransactionService.getBranches().subscribe({
      next: (data) => {
        this.branches = data;
      },
      error: (error) => {
        console.error('Error loading branches:', error);
        // Fallback data
        this.branches = [
          { value: '0001', label: 'Branch 0001' },
          { value: '0002', label: 'Branch 0002' },
          { value: '0005', label: 'Branch 0005' }
        ];
      }
    });

    this.returnTransactionService.getHubs().subscribe({
      next: (data) => {
        this.hubs = data;
      },
      error: (error) => {
        console.error('Error loading hubs:', error);
        // Fallback data
        this.hubs = [
          { value: 'KARACHI-10', label: 'Karachi 10' },
          { value: 'LAHORE-5', label: 'Lahore 5' },
          { value: 'ISLAMABAD-3', label: 'Islamabad 3' }
        ];
      }
    });

    this.returnTransactionService.getStatusOptions().subscribe({
      next: (data) => {
        this.statusOptions = data;
      },
      error: (error) => {
        console.error('Error loading status options:', error);
        // Fallback data
        this.statusOptions = [
          { value: 'Return', label: 'Return' },
          { value: 'Processing', label: 'Processing' },
          { value: 'Completed', label: 'Completed' }
        ];
      }
    });

    this.returnTransactionService.getInstrumentOptions().subscribe({
      next: (data) => {
        this.instrumentOptions = data;
      },
      error: (error) => {
        console.error('Error loading instrument options:', error);
        // Fallback data
        this.instrumentOptions = [
          { value: 'Cheque', label: 'Cheque' },
          { value: 'Pay order', label: 'Pay Order' },
          { value: 'DD', label: 'Demand Draft' }
        ];
      }
    });

    this.returnTransactionService.getCycleOptions().subscribe({
      next: (data) => {
        this.cycleOptions = data;
      },
      error: (error) => {
        console.error('Error loading cycle options:', error);
        // Fallback data
        this.cycleOptions = [
          { value: 'Normal', label: 'Normal' },
          { value: 'Express', label: 'Express' },
          { value: 'Same Day', label: 'Same Day' }
        ];
      }
    });

    // Load res core options
    this.resCoreOptions = [
      { value: 'core1', label: 'Core 1' },
      { value: 'core2', label: 'Core 2' },
      { value: 'core3', label: 'Core 3' }
    ];

    // Load return reason options
    this.returnTransactionService.getReturnReasonOptions().subscribe({
      next: (data) => {
        this.returnReasonOptions = data;
      },
      error: (error) => {
        console.error('Error loading return reason options:', error);
        // Fallback data
        this.returnReasonOptions = [
          { value: 'insufficient_funds', label: 'Insufficient Funds' },
          { value: 'account_closed', label: 'Account Closed' },
          { value: 'signature_mismatch', label: 'Signature Mismatch' },
          { value: 'stop_payment', label: 'Stop Payment' },
          { value: 'amount_exceeds_limit', label: 'Amount Exceeds Limit' }
        ];
      }
    });
  }

  loadReturnTransactions(): void {
    this.isLoading = true;
    
    this.returnTransactionService.getReturnTransactions({
      branch: this.selectedBranch,
      accountNumber: this.accountNumber,
      chequeNumber: this.chequeNumber,
      hub: this.selectedHub,
      resCore: this.selectedResCore,
      status: this.selectedStatus,
      instrument: this.selectedInstrument,
      cycle: this.selectedCycle,
      page: this.currentPage,
      pageSize: this.pageSize
    }).subscribe({
      next: (response) => {
        this.returnTransactions = response.items || [];
        this.totalRecords = response.totalCount || 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading return transactions:', error);
        this.isLoading = false;
      }
    });
  }

  validateAccountNumber(): void {
    // Account number validation logic
    if (this.accountNumber && this.accountNumber.length !== 16) {
      // Show validation error
    }
  }

  validateChequeNumber(): void {
    // Cheque number validation logic
    if (this.chequeNumber && this.chequeNumber.length !== 8) {
      // Show validation error
    }
  }

  toggleSelectAll(event: any): void {
    const isChecked = event.target.checked;
    this.returnTransactions.forEach(transaction => {
      transaction.selected = isChecked;
    });
  }

  toggleTransactionSelection(transaction: any, event: any): void {
    transaction.selected = event.target.checked;
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
    this.loadReturnTransactions();
  }

  applyFilters(): void {
    // Apply filter logic
    this.currentPage = 1; // Reset to first page
    this.loadReturnTransactions();
  }

  resetFilters(): void {
    // Reset all filter values
    this.selectedBranch = '';
    this.accountNumber = '';
    this.chequeNumber = '';
    this.selectedHub = '';
    this.selectedResCore = '';
    this.selectedStatus = '';
    this.selectedInstrument = '';
    this.selectedCycle = '';
    
    // Reload data
    this.currentPage = 1; // Reset to first page
    this.loadReturnTransactions();
  }

  exportData(): void {
    this.returnTransactionService.exportData({
      branch: this.selectedBranch,
      accountNumber: this.accountNumber,
      chequeNumber: this.chequeNumber,
      hub: this.selectedHub,
      resCore: this.selectedResCore,
      status: this.selectedStatus,
      instrument: this.selectedInstrument,
      cycle: this.selectedCycle
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `return-transactions-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error exporting data:', error);
        alert('Error exporting data. Please try again.');
      }
    });
  }

  reversalTransaction(): void {
    const selectedTransactions = this.returnTransactions.filter(t => t.selected);
    if (selectedTransactions.length === 0) {
      alert('Please select at least one transaction for reversal.');
      return;
    }

    if (confirm(`Are you sure you want to reverse ${selectedTransactions.length} transaction(s)?`)) {
      selectedTransactions.forEach(transaction => {
        this.returnTransactionService.reversalTransaction(transaction.id).subscribe({
          next: (response) => {
            console.log('Transaction reversed successfully:', transaction.id);
            // Reload data after successful reversal
            this.loadReturnTransactions();
          },
          error: (error) => {
            console.error('Error reversing transaction:', transaction.id, error);
          }
        });
      });
    }
  }

  downloadFile(): void {
    this.returnTransactionService.downloadFile({
      branch: this.selectedBranch,
      accountNumber: this.accountNumber,
      chequeNumber: this.chequeNumber,
      hub: this.selectedHub,
      resCore: this.selectedResCore,
      status: this.selectedStatus,
      instrument: this.selectedInstrument,
      cycle: this.selectedCycle
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `return-transactions-file-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading file:', error);
        alert('Error downloading file. Please try again.');
      }
    });
  }

  
  // Computed property for filtered transactions
  get filteredTransactions(): any[] {
    return this.returnTransactions;
  }
}
