import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import Swal from 'sweetalert2';

interface HubItem {
  id: number;
  code: string;
  name: string;
  creditAccountSameDay: string;
  creditAccountNormal: string;
  creditAccountIntercity: string;
  creditAccountDollar: string;
}

@Component({
  selector: 'app-hub',
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './hub.component.html',
  styleUrl: './hub.component.scss'
})
export class Hub {
  searchName = '';
  isEditMode = false;
  currentPage: number = 1;
  pageSize: number = 10;

  hubs: HubItem[] = [
    { id: 1, code: 'HUB-001', name: 'Central Hub', creditAccountSameDay: 'ACC-SD-001', creditAccountNormal: 'ACC-N-001', creditAccountIntercity: 'ACC-IC-001', creditAccountDollar: 'ACC-D-001' },
    { id: 2, code: 'HUB-002', name: 'North Hub', creditAccountSameDay: 'ACC-SD-002', creditAccountNormal: 'ACC-N-002', creditAccountIntercity: 'ACC-IC-002', creditAccountDollar: 'ACC-D-002' },
    { id: 3, code: 'HUB-003', name: 'South Hub', creditAccountSameDay: 'ACC-SD-003', creditAccountNormal: 'ACC-N-003', creditAccountIntercity: 'ACC-IC-003', creditAccountDollar: 'ACC-D-003' },
    { id: 4, code: 'HUB-004', name: 'East Hub', creditAccountSameDay: 'ACC-SD-004', creditAccountNormal: 'ACC-N-004', creditAccountIntercity: 'ACC-IC-004', creditAccountDollar: 'ACC-D-004' },
    { id: 5, code: 'HUB-005', name: 'West Hub', creditAccountSameDay: 'ACC-SD-005', creditAccountNormal: 'ACC-N-005', creditAccountIntercity: 'ACC-IC-005', creditAccountDollar: 'ACC-D-005' },
    { id: 6, code: 'HUB-006', name: 'Airport Hub', creditAccountSameDay: 'ACC-SD-006', creditAccountNormal: 'ACC-N-006', creditAccountIntercity: 'ACC-IC-006', creditAccountDollar: 'ACC-D-006' },
    { id: 7, code: 'HUB-007', name: 'Industrial Hub', creditAccountSameDay: 'ACC-SD-007', creditAccountNormal: 'ACC-N-007', creditAccountIntercity: 'ACC-IC-007', creditAccountDollar: 'ACC-D-007' },
    { id: 8, code: 'HUB-008', name: 'Downtown Hub', creditAccountSameDay: 'ACC-SD-008', creditAccountNormal: 'ACC-N-008', creditAccountIntercity: 'ACC-IC-008', creditAccountDollar: 'ACC-D-008' },
    { id: 9, code: 'HUB-009', name: 'Shopping Hub', creditAccountSameDay: 'ACC-SD-009', creditAccountNormal: 'ACC-N-009', creditAccountIntercity: 'ACC-IC-009', creditAccountDollar: 'ACC-D-009' },
    { id: 10, code: 'HUB-010', name: 'University Hub', creditAccountSameDay: 'ACC-SD-010', creditAccountNormal: 'ACC-N-010', creditAccountIntercity: 'ACC-IC-010', creditAccountDollar: 'ACC-D-010' },
    { id: 11, code: 'HUB-011', name: 'Hospital Hub', creditAccountSameDay: 'ACC-SD-011', creditAccountNormal: 'ACC-N-011', creditAccountIntercity: 'ACC-IC-011', creditAccountDollar: 'ACC-D-011' },
    { id: 12, code: 'HUB-012', name: 'Station Hub', creditAccountSameDay: 'ACC-SD-012', creditAccountNormal: 'ACC-N-012', creditAccountIntercity: 'ACC-IC-012', creditAccountDollar: 'ACC-D-012' },
  ];

  selectedHub: HubItem = this.getEmptyHub();

  constructor() {
    // Total records will be updated dynamically based on filtered data
  }

  get totalRecords(): number {
    return this.filteredHubs.length;
  }

  get filteredHubs(): HubItem[] {
    const q = this.searchName.trim().toLowerCase();
    if (!q) return this.hubs;
    return this.hubs.filter((h) => h.name.toLowerCase().includes(q));
  }

  get paginatedHubs(): HubItem[] {
    if (!this.filteredHubs || this.filteredHubs.length === 0) {
      return [];
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredHubs.slice(startIndex, endIndex);
  }

  onPageChange(event: { page: number; pageSize: number }) {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
  }

  onAddNew() {
    this.selectedHub = this.getEmptyHub();
    this.isEditMode = false;
    this.openModal();
  }

  onEdit(hub: HubItem) {
    this.selectedHub = { ...hub };
    this.isEditMode = true;
    this.openModal();
  }

  onDelete(hub: HubItem) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${hub.name}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result: any) => {
      if (result.isConfirmed) {
        const actualIndex = this.hubs.findIndex(h => h.id === hub.id);
        if (actualIndex !== -1) {
          this.hubs.splice(actualIndex, 1);
          
          // Adjust current page if necessary
          const totalPages = Math.ceil(this.totalRecords / this.pageSize);
          if (this.currentPage > totalPages && totalPages > 0) {
            this.currentPage = totalPages;
          }
          
          Swal.fire({
            title: 'Deleted!',
            text: `${hub.name} has been deleted successfully.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        }
      }
    });
  }

  onSave() {
    if (!this.selectedHub.code || !this.selectedHub.name || !this.selectedHub.creditAccountSameDay || !this.selectedHub.creditAccountNormal || !this.selectedHub.creditAccountIntercity || !this.selectedHub.creditAccountDollar) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill in all required fields',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.isEditMode) {
      const idx = this.hubs.findIndex((h) => h.id === this.selectedHub.id);
      if (idx !== -1) this.hubs[idx] = { ...this.selectedHub };
    } else {
      const newId = this.hubs.length ? Math.max(...this.hubs.map((h) => h.id)) + 1 : 1;
      this.hubs.push({ ...this.selectedHub, id: newId });
      
      // Go to last page to show the new item
      const totalPages = Math.ceil(this.totalRecords / this.pageSize);
      this.currentPage = totalPages;
    }

    this.closeModal();
  }

  private getEmptyHub(): HubItem {
    return { 
      id: 0, 
      code: '', 
      name: '', 
      creditAccountSameDay: '', 
      creditAccountNormal: '', 
      creditAccountIntercity: '', 
      creditAccountDollar: '' 
    };
  }

  private openModal() {
    const modalElement = document.getElementById('hubModal');
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }

  private closeModal() {
    const modalElement = document.getElementById('hubModal');
    const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();
  }
}
