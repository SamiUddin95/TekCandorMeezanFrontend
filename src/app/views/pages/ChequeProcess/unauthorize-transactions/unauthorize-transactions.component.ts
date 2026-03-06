import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Router } from '@angular/router';
import { UnauthorizeTransactionsService, UnauthorizeTransaction } from '../../../../services/unauthorize-transactions.service';
import { PaginationComponent } from '../../../../components/pagination/pagination.component';
import {
  tablerSearch,
  tablerFilter,
  tablerRefresh,
  tablerEye,
  tablerCheck,
  tablerX,
  tablerAlertTriangle
} from '@ng-icons/tabler-icons';

@Component({
  selector: 'app-unauthorize-transactions',
  templateUrl: './unauthorize-transactions.component.html',
  styleUrls: ['./unauthorize-transactions.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, PaginationComponent],
  providers: [provideIcons({ tablerSearch, tablerFilter, tablerRefresh, tablerEye, tablerCheck, tablerX, tablerAlertTriangle })]
})
export class UnauthorizeTransactionsComponent implements OnInit {

  // Component properties
  branches: any[] = [];
  hubs: any[] = [];
  unauthorizeTransactions: UnauthorizeTransaction[] = [];
  filteredTransactions: UnauthorizeTransaction[] = [];

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
    { value: 'unauthorized', label: 'Unauthorized' },
    { value: 'pending', label: 'Pending' }
  ];

  instrumentOptions = [
    { value: 'cheque', label: 'Cheque' },
    { value: 'pay_order', label: 'Pay Order' }
  ];

  cycleOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'express', label: 'Express' }
  ];

  cbcStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  branchStatusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ];

  constructor(
    private unauthorizeTransactionsService: UnauthorizeTransactionsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDropdownData();
    this.loadUnauthorizeTransactions();
  }

  // Load dropdown data
  loadDropdownData(): void {
    // Load branches
    this.unauthorizeTransactionsService.getBranches().subscribe({
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
    this.unauthorizeTransactionsService.getHubs().subscribe({
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

  // Load unauthorize transactions
  loadUnauthorizeTransactions(): void {
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

    this.unauthorizeTransactionsService.getUnauthorizeTransactions(filters).subscribe({
      next: (response: any) => {
        this.unauthorizeTransactions = response.items || [];
        this.totalRecords = response.totalCount || 0;
        this.totalPages = response.totalPages || 0;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading unauthorize transactions:', error);
        this.isLoading = false;
        // Fallback data
        this.unauthorizeTransactions = [
          {
            id: 949444,
            date: '2026-03-06T00:00:00',
            senderBankCode: 'HABIB METROPOLITAN BANK LTD.',
            receiverBranchCode: '0005',
            chequeNumber: '02066693',
            accountNumber: '0099340204346125',
            transactionCode: '020',
            status: 'Unauthorized',
            amount: 130560,
            accountBalance: '.00',
            accountTitle: 'John Doe',
            accountStatus: 'Normal',
            currency: null,
            hubCode: 'KARACHI-10',
            cycleCode: 'Normal',
            instrumentNo: 'Pay order',
            branchStatus: 'Active',
            cbcStatus: 'Pending',
            error: true,
            export: true,
            returnReason: 'Unauthorized transaction',
            postRestriction: null
          }
        ];
        this.totalRecords = this.unauthorizeTransactions.length;
        this.totalPages = 1;
      }
    });
  }

  // Show transaction details
  showTransactionDetails(transaction: UnauthorizeTransaction): void {
    this.router.navigate(['/pages/ChequeProcess/unauthorize-transactions-details', transaction.id]);
  }

  // Apply filters
  applyFilters(): void {
    this.currentPage = 1; // Reset to first page
    this.loadUnauthorizeTransactions();
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
    this.loadUnauthorizeTransactions();
  }

  // Pagination change
  onPageChange(event: { page: number; pageSize: number }): void {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
    this.loadUnauthorizeTransactions();
  }

  // Computed property for filtered transactions
  get filteredUnauthorizeTransactions(): UnauthorizeTransaction[] {
    return this.unauthorizeTransactions;
  }
}
