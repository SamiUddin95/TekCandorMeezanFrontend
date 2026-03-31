import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Router } from '@angular/router';
import { SystemRejectedChequesService, SystemRejectedCheque } from '../../../../services/system-rejected-cheques.service';
import { FilterService } from '../../../../services/filter.service';
import { PaginationComponent } from '../../../../components/pagination/pagination.component';
import { SpinnerComponent } from '../../../../components/spinner/spinner.component';
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
  selector: 'app-system-rejected-cheques',
  templateUrl: './system-rejected-cheques.component.html',
  styleUrls: ['./system-rejected-cheques.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, PaginationComponent, SpinnerComponent],
  providers: [provideIcons({ tablerSearch, tablerFilter, tablerRefresh, tablerEye, tablerCheck, tablerX, tablerAlertTriangle })]
})
export class SystemRejectedChequesComponent implements OnInit {

  // Component properties
  branches: any[] = [];
  hubs: any[] = [];
  systemRejectedCheques: SystemRejectedCheque[] = [];
  filteredCheques: SystemRejectedCheque[] = [];
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

  postingRestrictionOptions = [
    { value: '', label: 'No Restriction' },
    { value: 'Account Inactive', label: 'Account Inactive' },
    { value: 'Account Frozen', label: 'Account Frozen' },
    { value: 'Account Closed', label: 'Account Closed' }
  ];

  branchStatusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ];

  constructor(
    private systemRejectedChequesService: SystemRejectedChequesService,
    private filterService: FilterService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDropdownData();
    this.loadSystemRejectedCheques();
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

  // Load system rejected cheques
  loadSystemRejectedCheques(): void {
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

    this.systemRejectedChequesService.getSystemRejectedCheques(filters).subscribe({
      next: (response: any) => {
        this.systemRejectedCheques = response.items || [];
        this.totalRecords = response.totalCount || 0;
        this.totalPages = response.totalPages || 0;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading system rejected cheques:', error);
        this.isLoading = false;
        // Fallback data matching real API response
        this.systemRejectedCheques = [
          {
            id: 949398,
            date: '2026-03-09T00:00:00',
            senderBankCode: 'HABIB METROPOLITAN BANK LTD.',
            receiverBranchCode: '0005',
            chequeNumber: '11296558',
            accountNumber: '0099340204346125',
            transactionCode: '000',
            status: 'Rejected',
            amount: 5220,
            accountBalance: '.00',
            accountTitle: '',
            accountStatus: 'Normal',
            currency: null,
            hubCode: 'KARACHI-10',
            cycleCode: 'Normal',
            instrumentNo: 'Cheque',
            branchStatus: null,
            cbcStatus: null,
            error: true,
            export: true,
            returnReason: null,
            postRestriction: null
          },
          {
            id: 949399,
            date: '2026-03-09T00:00:00',
            senderBankCode: 'HABIB METROPOLITAN BANK LTD.',
            receiverBranchCode: '0005',
            chequeNumber: '22741383',
            accountNumber: '0099340204346125',
            transactionCode: '000',
            status: 'Rejected',
            amount: 960000,
            accountBalance: '.00',
            accountTitle: '',
            accountStatus: 'Normal',
            currency: null,
            hubCode: 'KARACHI-10',
            cycleCode: 'Normal',
            instrumentNo: 'Cheque',
            branchStatus: null,
            cbcStatus: null,
            error: true,
            export: true,
            returnReason: '101-Amount in words and figures differs',
            postRestriction: 'Account Inactive'
          },
          {
            id: 949394,
            date: '2026-03-09T00:00:00',
            senderBankCode: 'HABIB METROPOLITAN BANK LTD.',
            receiverBranchCode: '0005',
            chequeNumber: '02066693',
            accountNumber: '0099340204346125',
            transactionCode: '020',
            status: 'Rejected',
            amount: 130560,
            accountBalance: '.00',
            accountTitle: '',
            accountStatus: 'Normal',
            currency: null,
            hubCode: 'KARACHI-10',
            cycleCode: 'Normal',
            instrumentNo: 'Pay order',
            branchStatus: null,
            cbcStatus: null,
            error: true,
            export: true,
            returnReason: null,
            postRestriction: null
          }
        ];
        this.totalRecords = this.systemRejectedCheques.length;
        this.totalPages = 1;
      }
    });
  }

  // Toggle select all
  toggleSelectAll(event: any): void {
    const isChecked = event.target.checked;
    this.allSelected = isChecked;
    this.systemRejectedCheques.forEach(cheque => {
      cheque.selected = isChecked;
    });
  }

  // Toggle cheque selection
  toggleChequeSelection(cheque: SystemRejectedCheque, event: any): void {
    cheque.selected = event.target.checked;
    this.updateSelectAllState();
  }

  // Update select all state
  updateSelectAllState(): void {
    const totalCheques = this.systemRejectedCheques.length;
    const selectedCheques = this.systemRejectedCheques.filter(c => c.selected).length;
    this.allSelected = totalCheques > 0 && selectedCheques === totalCheques;
  }

  // Get selected cheques
  getSelectedCheques(): SystemRejectedCheque[] {
    return this.systemRejectedCheques.filter(cheque => cheque.selected);
  }

  // Show cheque details
  showChequeDetails(cheque: SystemRejectedCheque): void {
    this.router.navigate(['/pages/ChequeProcess/system-rejected-cheques-details', cheque.id]);
  }

  // Apply filters
  applyFilters(): void {
    this.currentPage = 1; // Reset to first page
    this.loadSystemRejectedCheques();
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
    this.loadSystemRejectedCheques();
  }

  // Pagination change
  onPageChange(event: { page: number; pageSize: number }): void {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
    this.loadSystemRejectedCheques();
  }

  // Computed property for filtered cheques
  get filteredSystemRejectedCheques(): SystemRejectedCheque[] {
    return this.systemRejectedCheques;
  }
}
