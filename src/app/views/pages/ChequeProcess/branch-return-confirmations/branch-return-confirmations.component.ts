import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Router } from '@angular/router';
import { BranchReturnService, BranchReturnConfirmation } from '../../../../services/branch-return.service';
import { FilterService } from '../../../../services/filter.service';
import { PaginationComponent } from '../../../../components/pagination/pagination.component';
import { SpinnerComponent } from '../../../../components/spinner/spinner.component';
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
  imports: [CommonModule, FormsModule, NgIcon, PaginationComponent, SpinnerComponent],
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
  branchReturnConfirmations: BranchReturnConfirmation[] = [];
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
    private branchReturnService: BranchReturnService,
    private filterService: FilterService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDropdownData();
    this.loadBranchReturnConfirmations();
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

  applyFilters(): void {
    this.currentPage = 1;
    this.loadBranchReturnConfirmations();
  }

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
    this.loadBranchReturnConfirmations();
  }

  // Computed property for filtered confirmations
  get filteredConfirmations(): any[] {
    return this.branchReturnConfirmations;
  }
}
