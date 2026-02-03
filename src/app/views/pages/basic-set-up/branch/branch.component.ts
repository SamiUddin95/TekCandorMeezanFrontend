import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import Swal from 'sweetalert2';

interface BranchItem {
  id: number;
  name: string;
  code: string;
  hub: string;
  numericReturnCodes: string;
  email1: string;
  email2: string;
  email3: string;
}

@Component({
  selector: 'app-branch',
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './branch.component.html',
  styleUrl: './branch.component.scss'
})
export class Branch {
  searchName = '';
  isEditMode = false;
  currentPage: number = 1;
  pageSize: number = 10;

  branches: BranchItem[] = [
    { id: 1, name: 'Main Branch', code: 'BR-001', hub: 'Hub A', numericReturnCodes: 'NIFT-001', email1: 'main@bank.com', email2: 'main2@bank.com', email3: 'main3@bank.com' },
    { id: 2, name: 'City Branch', code: 'BR-002', hub: 'Hub B', numericReturnCodes: 'NIFT-002', email1: 'city@bank.com', email2: 'city2@bank.com', email3: 'city3@bank.com' },
    { id: 3, name: 'Airport Branch', code: 'BR-003', hub: 'Hub A', numericReturnCodes: 'NIFT-003', email1: 'airport@bank.com', email2: 'airport2@bank.com', email3: 'airport3@bank.com' },
    { id: 4, name: 'Downtown Branch', code: 'BR-004', hub: 'Hub C', numericReturnCodes: 'NIFT-004', email1: 'downtown@bank.com', email2: 'downtown2@bank.com', email3: 'downtown3@bank.com' },
    { id: 5, name: 'Industrial Branch', code: 'BR-005', hub: 'Hub B', numericReturnCodes: 'NIFT-005', email1: 'industrial@bank.com', email2: 'industrial2@bank.com', email3: 'industrial3@bank.com' },
    { id: 6, name: 'Shopping Mall Branch', code: 'BR-006', hub: 'Hub A', numericReturnCodes: 'NIFT-006', email1: 'mall@bank.com', email2: 'mall2@bank.com', email3: 'mall3@bank.com' },
    { id: 7, name: 'University Branch', code: 'BR-007', hub: 'Hub D', numericReturnCodes: 'NIFT-007', email1: 'university@bank.com', email2: 'university2@bank.com', email3: 'university3@bank.com' },
    { id: 8, name: 'Hospital Branch', code: 'BR-008', hub: 'Hub C', numericReturnCodes: 'NIFT-008', email1: 'hospital@bank.com', email2: 'hospital2@bank.com', email3: 'hospital3@bank.com' },
    { id: 9, name: 'Station Branch', code: 'BR-009', hub: 'Hub B', numericReturnCodes: 'NIFT-009', email1: 'station@bank.com', email2: 'station2@bank.com', email3: 'station3@bank.com' },
    { id: 10, name: 'Beach Branch', code: 'BR-010', hub: 'Hub A', numericReturnCodes: 'NIFT-010', email1: 'beach@bank.com', email2: 'beach2@bank.com', email3: 'beach3@bank.com' },
    { id: 11, name: 'Park Branch', code: 'BR-011', hub: 'Hub D', numericReturnCodes: 'NIFT-011', email1: 'park@bank.com', email2: 'park2@bank.com', email3: 'park3@bank.com' },
    { id: 12, name: 'Market Branch', code: 'BR-012', hub: 'Hub C', numericReturnCodes: 'NIFT-012', email1: 'market@bank.com', email2: 'market2@bank.com', email3: 'market3@bank.com' },
  ];

  selectedBranch: BranchItem = this.getEmptyBranch();
  hubOptions = ['Hub A', 'Hub B', 'Hub C', 'Hub D'];

  constructor() {
    // Total records will be updated dynamically based on filtered data
  }

  get totalRecords(): number {
    return this.filteredBranches.length;
  }

  get filteredBranches(): BranchItem[] {
    const q = this.searchName.trim().toLowerCase();
    if (!q) return this.branches;
    return this.branches.filter((b) => b.name.toLowerCase().includes(q));
  }

  get paginatedBranches(): BranchItem[] {
    if (!this.filteredBranches || this.filteredBranches.length === 0) {
      return [];
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredBranches.slice(startIndex, endIndex);
  }

  onPageChange(event: { page: number; pageSize: number }) {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
  }

  onAddNew() {
    this.selectedBranch = this.getEmptyBranch();
    this.isEditMode = false;
    this.openModal();
  }

  onEdit(branch: BranchItem) {
    this.selectedBranch = { ...branch };
    this.isEditMode = true;
    this.openModal();
  }

  onDelete(branch: BranchItem) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${branch.name}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result: any) => {
      if (result.isConfirmed) {
        const actualIndex = this.branches.findIndex(b => b.id === branch.id);
        if (actualIndex !== -1) {
          this.branches.splice(actualIndex, 1);
          
          // Adjust current page if necessary
          const totalPages = Math.ceil(this.totalRecords / this.pageSize);
          if (this.currentPage > totalPages && totalPages > 0) {
            this.currentPage = totalPages;
          }
          
          Swal.fire({
            title: 'Deleted!',
            text: `${branch.name} has been deleted successfully.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        }
      }
    });
  }

  onSave() {
    if (!this.selectedBranch.name || !this.selectedBranch.code || !this.selectedBranch.numericReturnCodes || !this.selectedBranch.hub) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill in all required fields',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.isEditMode) {
      const idx = this.branches.findIndex((b) => b.id === this.selectedBranch.id);
      if (idx !== -1) this.branches[idx] = { ...this.selectedBranch };
    } else {
      const newId = this.branches.length ? Math.max(...this.branches.map((b) => b.id)) + 1 : 1;
      this.branches.push({ ...this.selectedBranch, id: newId });
      
      // Go to last page to show the new item
      const totalPages = Math.ceil(this.totalRecords / this.pageSize);
      this.currentPage = totalPages;
    }

    this.closeModal();
  }

  private getEmptyBranch(): BranchItem {
    return { 
      id: 0, 
      name: '', 
      code: '', 
      hub: '', 
      numericReturnCodes: '', 
      email1: '', 
      email2: '', 
      email3: '' 
    };
  }

  private openModal() {
    const modalElement = document.getElementById('branchModal');
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }

  private closeModal() {
    const modalElement = document.getElementById('branchModal');
    const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();
  }
}
