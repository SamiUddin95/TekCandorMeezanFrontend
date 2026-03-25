import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PendingChequeService, PendingChequeRecord, Branch, Hub } from '../../../../services/pending-cheque.service';
import { FilterService } from '../../../../services/filter.service';
import { ChequeDepositService } from '../../../../services/cheque-deposit.service';
import { PaginationComponent } from '../../../../components/pagination/pagination.component';
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

  statusOptions: any[] = [];
  instrumentOptions: any[] = [];
  cycleOptions: any[] = [];

  constructor(
    private pendingChequeService: PendingChequeService,
    private filterService: FilterService,
    private router: Router,
    private http: HttpClient,
    private chequeDepositService: ChequeDepositService
  ) { }

  ngOnInit(): void {
    this.loadDropdownData();
    // Don't load pending cheques automatically - wait for search button click
  }

  // Load dropdown data
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
    this.amount = '';
    this.selectedHub = '';
    this.selectedResCore = '';
    this.selectedStatus = '';
    this.selectedInstrument = '';
    this.selectedCycle = '';
    this.currentPage = 1;
    
    // Clear data without loading - user must click search
    this.pendingCheques = [];
    this.filteredCheques = [];
    this.totalRecords = 0;
    this.totalPages = 0;
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

  // Send selected cheques to in-process
  sendToInProcess(): void {
    const selectedCheques = this.getSelectedCheques();
    
    if (selectedCheques.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Selection',
        text: 'Please select at least one cheque to send to in-process.',
        confirmButtonColor: '#6f42c1'
      });
      return;
    }

    // Show confirmation dialog
    Swal.fire({
      title: 'Are you sure?',
      html: `
        <p>You are about to send <strong>${selectedCheques.length}</strong> cheque(s) to in-process.</p>
        <p>This action cannot be undone.</p>
        <p>Do you want to continue?</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6f42c1',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Yes, send to in-process!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.processSendToInProcess(selectedCheques);
      }
    });
  }

  // Process the API call to send cheques to in-process
  private processSendToInProcess(selectedCheques: PendingChequeRecord[]): void {
    Swal.fire({
      title: 'Processing...',
      text: 'Please wait while we send cheques to in-process...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Process each selected cheque
    const promises = selectedCheques.map(cheque => {
      return this.chequeDepositService.sendToInProcess(cheque.id).toPromise();
    });

    Promise.all(promises)
      .then((responses) => {
        
        // Check if all were successful
        const successCount = responses.filter(res => res?.status === 'success').length;
        const failureCount = responses.length - successCount;

        if (successCount === selectedCheques.length) {
          // All successful
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            html: `
              <p><strong>${successCount}</strong> cheque(s) successfully sent to in-process.</p>
            `,
            confirmButtonColor: '#6f42c1'
          });
          
          // Clear selections and refresh data
          this.clearSelections();
          this.loadPendingCheques();
        } else if (successCount > 0) {
          // Partial success
          Swal.fire({
            icon: 'warning',
            title: 'Partial Success',
            html: `
              <p><strong>${successCount}</strong> cheque(s) sent successfully.</p>
              <p><strong>${failureCount}</strong> cheque(s) failed to process.</p>
            `,
            confirmButtonColor: '#6f42c1'
          });
          
          // Clear selections and refresh data
          this.clearSelections();
          this.loadPendingCheques();
        } else {
          // All failed
          Swal.fire({
            icon: 'error',
            title: 'Processing Failed',
            html: `
              <p>Failed to send cheques to in-process.</p>
              <p>Please try again later.</p>
            `,
            confirmButtonColor: '#dc3545'
          });
        }
      })
      .catch((error) => {
        console.error('Send to in-process error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          html: `
            <p>An error occurred while processing your request.</p>
            <p>Please try again later.</p>
          `,
          confirmButtonColor: '#dc3545'
        });
      });
  }

  // Clear all selections
  private clearSelections(): void {
    this.allSelected = false;
    this.filteredCheques.forEach(cheque => {
      cheque.selected = false;
    });
  }

  // Approve selected cheques
  approveSelected(): void {
    const selectedCheques = this.getSelectedCheques();
    
    if (selectedCheques.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Selection',
        text: 'Please select at least one cheque to approve.',
        confirmButtonColor: '#198754'
      });
      return;
    }

    // Show confirmation dialog
    Swal.fire({
      title: 'Are you sure?',
      html: `
        <p>You are about to approve <strong>${selectedCheques.length}</strong> cheque(s).</p>
        <p>This action cannot be undone.</p>
        <p>Do you want to continue?</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Yes, approve selected!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.processApproveSelected(selectedCheques);
      }
    });
  }

  // Process the API call to approve selected cheques
  private processApproveSelected(selectedCheques: PendingChequeRecord[]): void {
    Swal.fire({
      title: 'Approving...',
      text: 'Please wait while we approve the selected cheques...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Extract selected IDs
    const selectedIds = selectedCheques.map(cheque => cheque.id);

    // Call the approve API with selected IDs
    this.chequeDepositService.approveSelected(selectedIds).subscribe({
      next: (response: any) => {
        
        if (response.status === 'success') {
          const data = response.data;
          const successCount = data.successCount || 0;
          const chequeNumbers = data.chequeNumbers || '';
          const message = data.message || '';

          if (successCount > 0) {
            // Success case
            Swal.fire({
              icon: 'success',
              title: 'Approval Successful!',
              html: `
                <p><strong>${successCount}</strong> cheque(s) successfully approved.</p>
                ${chequeNumbers ? `<p>Cheque Numbers: <strong>${chequeNumbers}</strong></p>` : ''}
                <p>${message}</p>
              `,
              confirmButtonColor: '#198754'
            });
            
            // Clear selections and refresh data
            this.clearSelections();
            this.loadPendingCheques();
          } else {
            // No cheques approved
            Swal.fire({
              icon: 'warning',
              title: 'No Approvals',
              html: `
                <p>No cheques were approved.</p>
                <p>${message}</p>
              `,
              confirmButtonColor: '#198754'
            });
          }
        } else {
          // API returned failure status
          Swal.fire({
            icon: 'error',
            title: 'Approval Failed',
            html: `
              <p>Failed to approve cheques.</p>
              <p>${response.errorMessage || 'Please try again later.'}</p>
            `,
            confirmButtonColor: '#dc3545'
          });
        }
      },
      error: (error: any) => {
        console.error('Approve selected error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          html: `
            <p>An error occurred while processing your approval request.</p>
            <p>Please try again later.</p>
          `,
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }
}
