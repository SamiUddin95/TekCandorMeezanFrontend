import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Router } from '@angular/router';
import { BranchReturnService } from '../../../../services/branch-return.service';
import { PaginationComponent } from '../../../../components/pagination/pagination.component';
import {
  tablerSearch,
  tablerCe,
  tablerPencil
} from '@ng-icons/tabler-icons';

@Component({
  selector: 'app-branch-return-confirmations',
  templateUrl: './branch-return-confirmations.component.html',
  styleUrls: ['./branch-return-confirmations.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, PaginationComponent],
  providers: [provideIcons({ tablerSearch, tablerCe, tablerPencil })]
})
export class BranchReturnConfirmationsComponent implements OnInit {

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
  branchReturnConfirmations: any[] = [];
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
  postingRestrictionOptions: any[] = [];

  constructor(
    private router: Router,
    private branchReturnService: BranchReturnService
  ) { }

  ngOnInit(): void {
    this.loadDropdownData();
    this.loadBranchReturnConfirmations();
  }

  loadDropdownData(): void {
    // Load branches, hubs, and other dropdown data
    this.branchReturnService.getBranches().subscribe({
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

    this.branchReturnService.getHubs().subscribe({
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

    this.branchReturnService.getStatusOptions().subscribe({
      next: (data) => {
        this.statusOptions = data;
      },
      error: (error) => {
        console.error('Error loading status options:', error);
        // Fallback data
        this.statusOptions = [
          { value: 'Rejected', label: 'Rejected' },
          { value: 'Pending', label: 'Pending' },
          { value: 'Confirmed', label: 'Confirmed' }
        ];
      }
    });

    this.branchReturnService.getInstrumentOptions().subscribe({
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

    this.branchReturnService.getCycleOptions().subscribe({
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

    // Load posting restriction options
    this.branchReturnService.getPostingRestrictionOptions().subscribe({
      next: (data) => {
        this.postingRestrictionOptions = data;
      },
      error: (error) => {
        console.error('Error loading posting restriction options:', error);
        // Fallback data
        this.postingRestrictionOptions = [
          { value: 'No Restriction', label: 'No Restriction' },
          { value: 'Account Frozen', label: 'Account Frozen' },
          { value: 'Limit Exceeded', label: 'Limit Exceeded' }
        ];
      }
    });
  }

  loadBranchReturnConfirmations(): void {
    this.isLoading = true;
    
    this.branchReturnService.getBranchReturnConfirmations({
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
        this.branchReturnConfirmations = response.items || [];
        this.totalRecords = response.totalCount || 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading branch return confirmations:', error);
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

  showBranchReturnDetails(confirmation: any): void {
    // Navigate to branch return details component
    this.router.navigate(['/pages/ChequeProcess/branch-return-details', confirmation.id]);
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
    this.loadBranchReturnConfirmations();
  }

  // Computed property for filtered confirmations
  get filteredConfirmations(): any[] {
    return this.branchReturnConfirmations;
  }
}
