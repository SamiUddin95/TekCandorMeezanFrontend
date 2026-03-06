import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Router } from '@angular/router';
import { ApprovedTransactionsService, ApprovedTransaction } from '../../../../services/approved-transactions.service';
import { PaginationComponent } from '../../../../components/pagination/pagination.component';
import {
  tablerSearch,
  tablerFilter,
  tablerRefresh,
  tablerArrowBackUp,
  tablerCheck,
  tablerX,
  tablerAlertTriangle
} from '@ng-icons/tabler-icons';

@Component({
  selector: 'app-approved-transactions',
  templateUrl: './approved-transactions.component.html',
  styleUrls: ['./approved-transactions.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, PaginationComponent],
  providers: [provideIcons({ tablerSearch, tablerFilter, tablerRefresh, tablerArrowBackUp, tablerCheck, tablerX, tablerAlertTriangle })]
})
export class ApprovedTransactionsComponent implements OnInit {

  // Component properties
  branches: any[] = [];
  hubs: any[] = [];
  approvedTransactions: ApprovedTransaction[] = [];
  filteredTransactions: ApprovedTransaction[] = [];
  allSelected: boolean = false;

  // Filter properties
  selectedBranch: string = '';
  accountNumber: string = '';
  chequeNumber: string = '';
  selectedHub: string = '';
  selectedResCore: string = '';
  selectedStatus: string = '';
  selectedInstrument: string = '';
  selectedCycle: string = '';

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 20;
  totalRecords: number = 0;
  totalPages: number = 0;

  // Loading states
  isLoading: boolean = false;
  isFiltering: boolean = false;

  // Dropdown options
  resCoreOptions = [
    { value: 'true', label: 'True' },
    { value: 'false', label: 'False' }
  ];

  statusOptions = [
    { value: 'approved', label: 'Approved' },
    { value: 'reversed', label: 'Reversed' }
  ];

  instrumentOptions = [
    { value: 'cheque', label: 'Cheque' },
    { value: 'pay_order', label: 'Pay Order' }
  ];

  cycleOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'express', label: 'Express' }
  ];

  // Reversal reason
  reversalReason: string = '';

  constructor(
    private approvedTransactionsService: ApprovedTransactionsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDropdownData();
    this.loadApprovedTransactions();
  }

  // Load dropdown data
  loadDropdownData(): void {
    // Load branches
    this.approvedTransactionsService.getBranches().subscribe({
      next: (response: any) => {
        this.branches = response.data || [];
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
    this.approvedTransactionsService.getHubs().subscribe({
      next: (response: any) => {
        this.hubs = response.data || [];
      },
      error: (error: any) => {
        console.error('Error loading hubs:', error);
        // Fallback data
        this.hubs = [
          { value: 'KARACHI-10', label: 'KARACHI-10' },
          { value: 'RAWALPINDI-40', label: 'RAWALPINDI-40' },
          { value: 'LAHORE-20', label: 'LAHORE-20' }
        ];
      }
    });
  }

  // Load approved transactions
  loadApprovedTransactions(): void {
    this.isLoading = true;
    
    const filters = {
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
    };

    this.approvedTransactionsService.getApprovedTransactions(filters).subscribe({
      next: (response: any) => {
        this.approvedTransactions = response.items || [];
        this.totalRecords = response.totalCount || 0;
        this.totalPages = response.totalPages || 0;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading approved transactions:', error);
        this.isLoading = false;
        this.totalRecords = this.approvedTransactions.length;
        this.totalPages = 1;
      }
    });
  }

  // Toggle select all
  toggleSelectAll(event: any): void {
    const isChecked = event.target.checked;
    this.allSelected = isChecked;
    this.approvedTransactions.forEach(transaction => {
      transaction.selected = isChecked;
    });
  }

  // Toggle transaction selection
  toggleTransactionSelection(transaction: ApprovedTransaction, event: any): void {
    transaction.selected = event.target.checked;
    this.updateSelectAllState();
  }

  // Update select all state
  updateSelectAllState(): void {
    const totalTransactions = this.approvedTransactions.length;
    const selectedTransactions = this.approvedTransactions.filter(t => t.selected).length;
    this.allSelected = totalTransactions > 0 && selectedTransactions === totalTransactions;
  }

  // Get selected transactions
  getSelectedTransactions(): ApprovedTransaction[] {
    return this.approvedTransactions.filter(transaction => transaction.selected);
  }

  // Reversal selected transactions
  reversalSelectedTransactions(): void {
    const selectedTransactions = this.getSelectedTransactions();
    
    if (selectedTransactions.length === 0) {
      alert('Please select at least one transaction for reversal.');
      return;
    }

    if (!this.reversalReason.trim()) {
      alert('Please provide a reason for reversal.');
      return;
    }

    const transactionIds = selectedTransactions.map(t => t.id);

    this.approvedTransactionsService.reversalTransaction(transactionIds, this.reversalReason).subscribe({
      next: (response: any) => {
        alert('Transactions reversed successfully!');
        this.loadApprovedTransactions(); // Reload data
        this.reversalReason = ''; // Clear reason
      },
      error: (error: any) => {
        console.error('Error reversing transactions:', error);
        alert('Error reversing transactions. Please try again.');
      }
    });
  }

  // Apply filters
  applyFilters(): void {
    this.currentPage = 1; // Reset to first page
    this.loadApprovedTransactions();
  }

  // Reset filters
  resetFilters(): void {
    this.selectedBranch = '';
    this.accountNumber = '';
    this.chequeNumber = '';
    this.selectedHub = '';
    this.selectedResCore = '';
    this.selectedStatus = '';
    this.selectedInstrument = '';
    this.selectedCycle = '';
    this.currentPage = 1;
    this.loadApprovedTransactions();
  }

  // Pagination change
  onPageChange(event: { page: number; pageSize: number }): void {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
    this.loadApprovedTransactions();
  }

  // Computed property for filtered transactions
  get filteredApprovedTransactions(): ApprovedTransaction[] {
    return this.approvedTransactions;
  }
}
