import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Router } from '@angular/router';
import { CallbackChequeService, CallbackCheque } from '../../../../services/callback-cheque.service';
import { FilterService } from '../../../../services/filter.service';
import { PaginationComponent } from '../../../../components/pagination/pagination.component';
import Swal from 'sweetalert2';
import {
  tablerSearch,
  tablerCe,
  tablerPencil
} from '@ng-icons/tabler-icons';

@Component({
  selector: 'app-callback-cheques',
  templateUrl: './callback-cheques.component.html',
  styleUrls: ['./callback-cheques.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, PaginationComponent],
  providers: [provideIcons({ tablerSearch, tablerCe, tablerPencil })]
})
export class CallbackChequesComponent implements OnInit {

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
  callbackCheques: any[] = [];
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

  constructor(
    private callbackChequeService: CallbackChequeService,
    private filterService: FilterService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDropdownData();
    // Don't load callback cheques automatically - wait for search button click
  }

  loadDropdownData(): void {
    // Load branches
    this.filterService.getBranches().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data && response.data.branches) {
          this.branches = response.data.branches;
        } else {
          this.branches = [];
        }
      },
      error: (error: any) => {
      }
    });

    // Load hubs
    this.filterService.getHubs().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data && response.data.hubs) {
          this.hubs = response.data.hubs;
        } else {
          this.hubs = [];
        }
      },
      error: (error: any) => {
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
        this.cycleOptions = [];
      }
    });

    // Load res core options
    this.resCoreOptions = [
      { value: 'true', label: 'True' },
      { value: 'false', label: 'False' }
    ];
  }

  loadCallbackCheques(): void {
    this.isLoading = true;
    
    this.callbackChequeService.getCallbackCheques({
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
        this.callbackCheques = response.items || [];
        this.totalRecords = response.totalCount || 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading callback cheques:', error);
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
    this.callbackCheques.forEach(cheque => {
      cheque.selected = isChecked;
    });
  }

  toggleChequeSelection(cheque: any, event: any): void {
    cheque.selected = event.target.checked;
  }

  showChequeDetails(cheque: any): void {
    // Navigate to callback cheque details component
    this.router.navigate(['/pages/ChequeProcess/callback-cheque-details', cheque.id]);
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
    this.loadCallbackCheques();
  }

  applyFilters(): void {
    // Apply filter logic
    this.loadCallbackCheques();
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
    
    // Clear data without loading - user must click search
    this.callbackCheques = [];
    this.totalRecords = 0;
    this.currentPage = 1;
  }

  exportData(): void {
    // Export logic
    console.log('Exporting data...');
  }

  // Computed property for filtered cheques
  get filteredCheques(): any[] {
    return this.callbackCheques;
  }
}
