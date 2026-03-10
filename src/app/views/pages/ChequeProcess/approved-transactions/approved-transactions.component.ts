import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Router } from '@angular/router';
import { ApprovedTransactionsService, ApprovedTransaction } from '../../../../services/approved-transactions.service';
import { FilterService } from '../../../../services/filter.service';
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

  statusOptions: any[] = [];
  instrumentOptions: any[] = [];
  cycleOptions: any[] = [];

  // Reversal reason
  reversalReason: string = '';

  constructor(
    private approvedTransactionsService: ApprovedTransactionsService,
    private filterService: FilterService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDropdownData();
    this.loadApprovedTransactions();
  }

  // Load dropdown data
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

    // Load status options
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

    // Load instrument options
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

    // Load cycle options
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
