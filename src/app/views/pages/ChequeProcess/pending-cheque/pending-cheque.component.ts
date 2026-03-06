import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  tablerSearch,
  tablerFilter,
  tablerRefresh,
  tablerEye,
  tablerEdit,
  tablerTrash,
  tablerCe,
  tablerBuilding,
  tablerUser,
  tablerCalendar,
  tablerClock,
  tablerCheck,
  tablerX,
  tablerAlertTriangle
} from '@ng-icons/tabler-icons';
import { PaginationComponent } from '../../../../components/pagination/pagination.component';
import { PendingChequeService, PendingChequeRecord, Branch, Hub } from '../../../../services/pending-cheque.service';
import { ChequeDepositService } from '../../../../services/cheque-deposit.service';
import Swal from 'sweetalert2';
declare var bootstrap: any;

@Component({
  selector: 'app-pending-cheque',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIcon,
    PaginationComponent
  ],
  providers: [
    provideIcons({
      tablerSearch,
      tablerFilter,
      tablerRefresh,
      tablerEye,
      tablerEdit,
      tablerTrash,
      tablerCe,
      tablerBuilding,
      tablerUser,
      tablerCalendar,
      tablerClock,
      tablerCheck,
      tablerX,
      tablerAlertTriangle
    })
  ],
  templateUrl: './pending-cheque.component.html',
  styleUrl: './pending-cheque.component.scss'
})
export class PendingChequeComponent implements OnInit {
  @ViewChild('detailsModal') detailsModal!: ElementRef;

  // Component properties
  branches: Branch[] = [];
  hubs: Hub[] = [];
  pendingCheques: PendingChequeRecord[] = [];
  filteredCheques: PendingChequeRecord[] = [];
  selectedCheque: PendingChequeRecord | null = null;
  allSelected: boolean = false;

  // Filter properties
  selectedBranch: string = '';
  accountNumber: string = '';
  amount: string = '';
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
    { value: 'pending', label: 'Pending' },
    { value: 'approved_reversed', label: 'Approved Reversed' },
    { value: 'manual_approved_reverse', label: 'Manual Approved Reverse' }
  ];

  instrumentOptions = [
    { value: 'cheque', label: 'Cheque' },
    { value: 'pay_order', label: 'Pay Order' },
    { value: 'non_standard', label: 'Non Standard' },
    { value: 'cdr', label: 'CDR' }
  ];

  cycleOptions = [
    { value: 'same_day', label: 'Same Day' },
    { value: 'same_day_return', label: 'Same Day Return' },
    { value: 'normal', label: 'Normal' },
    { value: 'normal_return', label: 'Normal Return' }
  ];

  constructor(
    private pendingChequeService: PendingChequeService,
    private router: Router,
    private http: HttpClient,
    private chequeDepositService: ChequeDepositService
  ) { }

  ngOnInit(): void {
    this.loadDropdownData();
    this.loadPendingCheques();
  }

  // Load dropdown data
  loadDropdownData(): void {
    // Load branches
    this.pendingChequeService.getBranches().subscribe({
      next: (response: any) => {
        if (response?.status === 'success') {
          this.branches = response.data || [];
        }
      },
      error: (error: any) => {
        console.error('Error loading branches:', error);
      }
    });

    // Load hubs
    this.pendingChequeService.getHubs().subscribe({
      next: (response: any) => {
        if (response?.status === 'success') {
          this.hubs = response.data || [];
        }
      },
      error: (error: any) => {
        console.error('Error loading hubs:', error);
      }
    });
  }

  // Load pending cheques
  loadPendingCheques(): void {
    this.isLoading = true;
    
    const filters = {
      branchCode: this.selectedBranch,
      accountNumber: this.accountNumber,
      amount: this.amount,
      chequeNumber: this.chequeNumber,
      hub: this.selectedHub,
      resCore: this.selectedResCore,
      status: this.selectedStatus,
      instrument: this.selectedInstrument,
      cycle: this.selectedCycle,
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    this.pendingChequeService.getPendingCheques(filters).subscribe({
      next: (response: any) => {
        if (response?.items) {
          this.pendingCheques = response.items || [];
          // Initialize selected property for each cheque
          this.pendingCheques.forEach(cheque => {
            cheque.selected = false;
          });
          this.totalRecords = response.totalCount || 0;
          this.totalPages = response.totalPages || 0;
          this.filteredCheques = [...this.pendingCheques];
        } else {
          this.pendingCheques = [];
          this.filteredCheques = [];
          this.totalRecords = 0;
          this.totalPages = 0;
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading pending cheques:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load pending cheques'
        });
        
        this.pendingCheques = [];
        this.filteredCheques = [];
        this.totalRecords = 0;
        this.totalPages = 0;
        this.isLoading = false;
      }
    });
  }

  // Apply filters
  applyFilters(): void {
    this.isFiltering = true;
    this.currentPage = 1; // Reset to first page
    
    this.pendingChequeService.getPendingCheques({
      branchCode: this.selectedBranch,
      accountNumber: this.accountNumber,
      chequeNumber: this.chequeNumber,
      hub: this.selectedHub,
      resCore: this.selectedResCore,
      status: this.selectedStatus,
      instrument: this.selectedInstrument,
      cycle: this.selectedCycle,
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    }).subscribe({
      next: (response: any) => {
        if (response?.items) {
          this.pendingCheques = response.items || [];
          // Initialize selected property for each cheque
          this.pendingCheques.forEach(cheque => {
            cheque.selected = false;
          });
          this.totalRecords = response.totalCount || 0;
          this.totalPages = response.totalPages || 0;
          this.filteredCheques = [...this.pendingCheques];
        } else {
          this.pendingCheques = [];
          this.filteredCheques = [];
          this.totalRecords = 0;
          this.totalPages = 0;
        }
        this.isFiltering = false;
      },
      error: (error: any) => {
        console.error('Error applying filters:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to apply filters'
        });
        
        this.pendingCheques = [];
        this.filteredCheques = [];
        this.totalRecords = 0;
        this.totalPages = 0;
        this.isFiltering = false;
      }
    });
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
    
    this.loadPendingCheques();
  }

  // Show cheque details
  showChequeDetails(cheque: PendingChequeRecord): void {
    // Make API call to get cheque details using service
    this.chequeDepositService.getChequeDetails(cheque.id).subscribe({
      next: (response: any) => {
        // Store the response data and navigate to cheque details page
        // You can pass the data via navigation params or a service
        this.router.navigate(['/pages/ChequeProcess/cheque-details', cheque.id], {
          state: { chequeData: response }
        });
      },
      error: (error: any) => {
        console.error('Error fetching cheque details:', error);
        // Still navigate even if API call fails
        this.router.navigate(['/pages/ChequeProcess/cheque-details', cheque.id]);
      }
    });
  }

  // Navigate to cheque details
  navigateToChequeDetails(chequeId: number): void {
    this.router.navigate(['/pages/ChequeProcess/cheque-details', chequeId]);
  }

  // Pagination
  onPageChange(event: { page: number; pageSize: number }): void {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
    this.loadPendingCheques();
  }

  // Account number validation (16 digits)
  validateAccountNumber(): void {
    if (this.accountNumber && !/^\d{16}$/.test(this.accountNumber)) {
      this.accountNumber = this.accountNumber.replace(/\D/g, '').slice(0, 16);
    }
  }

  // Cheque number validation (8 digits)
  validateChequeNumber(): void {
    if (this.chequeNumber && !/^\d{8}$/.test(this.chequeNumber)) {
      this.chequeNumber = this.chequeNumber.replace(/\D/g, '').slice(0, 8);
    }
  }

  // Get status label
  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'approved_reversed': 'Approved Reversed',
      'manual_approved_reverse': 'Manual Approved Reverse',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'reversed': 'Reversed'
    };
    return statusMap[status] || status;
  }

  // Toggle select all checkboxes
  toggleSelectAll(event: any): void {
    const isChecked = event.target.checked;
    this.allSelected = isChecked;
    
    this.filteredCheques.forEach(cheque => {
      cheque.selected = isChecked;
    });
  }

  // Toggle individual cheque selection
  toggleChequeSelection(cheque: PendingChequeRecord, event: any): void {
    cheque.selected = event.target.checked;
    
    // Update "select all" checkbox state
    const selectedCount = this.filteredCheques.filter(c => c.selected).length;
    this.allSelected = selectedCount === this.filteredCheques.length && this.filteredCheques.length > 0;
  }

  // Get selected cheques
  getSelectedCheques(): PendingChequeRecord[] {
    return this.filteredCheques.filter(cheque => cheque.selected);
  }

  // Get selected count
  getSelectedCount(): number {
    return this.filteredCheques.filter(cheque => cheque.selected).length;
  }
}
