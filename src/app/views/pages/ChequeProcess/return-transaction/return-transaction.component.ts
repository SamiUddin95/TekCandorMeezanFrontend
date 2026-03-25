import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Router } from '@angular/router';
import { ReturnTransactionService, ReturnTransaction } from '../../../../services/return-transaction.service';
import { FilterService } from '../../../../services/filter.service';
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
    private returnTransactionService: ReturnTransactionService,
    private filterService: FilterService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDropdownData();
    this.loadReturnTransactions();
  }

  loadDropdownData(): void {
    // Load branches
    this.filterService.getBranches().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data && response.data.branches) {
          this.branches = response.data.branches.map((branch: any) => ({
            value: branch.code,
            label: branch.name
          }));
        } else {
          this.branches = [];
        }
      },
      error: (error: any) => {
        console.error('Error loading branches:', error);
        // Fallback data
        this.branches = [
          { value: '0001', label: 'Branch 0001' },
          { value: '0002', label: 'Branch 0002' },
          { value: '0005', label: 'Branch 0005' }
        ];
      }
    });

    // Load hubs
    this.filterService.getHubs().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data && response.data.hubs) {
          this.hubs = response.data.hubs.map((hub: any) => ({
            value: hub.code,
            label: hub.name
          }));
        } else {
          this.hubs = [];
        }
      },
      error: (error: any) => {
        console.error('Error loading hubs:', error);
        // Fallback data
        this.hubs = [
          { value: '10', label: 'KARACHI-10' },
          { value: '40', label: 'RAWALPINDI-40' },
          { value: '20', label: 'LAHORE-20' }
        ];
      }
    });

    this.filterService.getStatusOptions().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data && response.data.statuses) {
          this.statusOptions = response.data.statuses.map((status: any) => ({
            value: status.value,
            label: status.text
          }));
        } else {
          this.statusOptions = [];
        }
      },
      error: (error: any) => {
        console.error('Error loading status options:', error);
        this.statusOptions = [];
      }
    });

    this.filterService.getInstrumentOptions().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data && response.data.instruments) {
          this.instrumentOptions = response.data.instruments.map((instrument: any) => ({
            value: instrument.value,
            label: instrument.text
          }));
        } else {
          this.instrumentOptions = [];
        }
      },
      error: (error: any) => {
        console.error('Error loading instrument options:', error);
        this.instrumentOptions = [];
      }
    });

    this.filterService.getCycleOptions().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data && response.data.cycles) {
          this.cycleOptions = response.data.cycles.map((cycle: any) => ({
            value: cycle.value,
            label: cycle.text
          }));
        } else {
          this.cycleOptions = [];
        }
      },
      error: (error: any) => {
        console.error('Error loading cycle options:', error);
        this.cycleOptions = [];
      }
    });

    // Load res core options
    this.resCoreOptions = [
      { value: 'true', label: 'True' },
      { value: 'false', label: 'False' }
    ];

    // Load return reason options
    this.filterService.getReturnReasonOptions().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data && response.data.returnReasons) {
          this.returnReasonOptions = response.data.returnReasons.map((reason: any) => ({
            value: reason.value,
            label: reason.text
          }));
        } else {
          this.returnReasonOptions = [];
        }
      },
      error: (error: any) => {
        console.error('Error loading return reason options:', error);
        this.returnReasonOptions = [];
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
