import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import Swal from 'sweetalert2';

interface CycleItem {
  id: number;
  name: string;
  code: string;
}

@Component({
  selector: 'app-cycle',
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './cycle.component.html',
  styleUrl: './cycle.component.scss'
})
export class Cycle {
  searchName = '';
  isEditMode = false;
  currentPage: number = 1;
  pageSize: number = 10;

  cycles: CycleItem[] = [
    { id: 1, name: 'Cycle A', code: 'CYC-A' },
    { id: 2, name: 'Cycle B', code: 'CYC-B' },
    { id: 3, name: 'Cycle C', code: 'CYC-C' },
    { id: 4, name: 'Cycle D', code: 'CYC-D' },
    { id: 5, name: 'Cycle E', code: 'CYC-E' },
    { id: 6, name: 'Cycle F', code: 'CYC-F' },
    { id: 7, name: 'Cycle G', code: 'CYC-G' },
    { id: 8, name: 'Cycle H', code: 'CYC-H' },
    { id: 9, name: 'Cycle I', code: 'CYC-I' },
    { id: 10, name: 'Cycle J', code: 'CYC-J' },
    { id: 11, name: 'Cycle K', code: 'CYC-K' },
    { id: 12, name: 'Cycle L', code: 'CYC-L' },
  ];

  selectedCycle: CycleItem = this.getEmptyCycle();

  constructor() {
    // Total records will be updated dynamically based on filtered data
  }

  get totalRecords(): number {
    return this.filteredCycles.length;
  }

  get filteredCycles(): CycleItem[] {
    const q = this.searchName.trim().toLowerCase();
    if (!q) return this.cycles;
    return this.cycles.filter((c) => c.name.toLowerCase().includes(q));
  }

  get paginatedCycles(): CycleItem[] {
    if (!this.filteredCycles || this.filteredCycles.length === 0) {
      return [];
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredCycles.slice(startIndex, endIndex);
  }

  onPageChange(event: { page: number; pageSize: number }) {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
  }

  onAddNew() {
    this.selectedCycle = this.getEmptyCycle();
    this.isEditMode = false;
    this.openModal();
  }

  onEdit(cycle: CycleItem) {
    this.selectedCycle = { ...cycle };
    this.isEditMode = true;
    this.openModal();
  }

  onDelete(cycle: CycleItem) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${cycle.name}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result: any) => {
      if (result.isConfirmed) {
        const actualIndex = this.cycles.findIndex(c => c.id === cycle.id);
        if (actualIndex !== -1) {
          this.cycles.splice(actualIndex, 1);
          
          // Adjust current page if necessary
          const totalPages = Math.ceil(this.totalRecords / this.pageSize);
          if (this.currentPage > totalPages && totalPages > 0) {
            this.currentPage = totalPages;
          }
          
          Swal.fire({
            title: 'Deleted!',
            text: `${cycle.name} has been deleted successfully.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        }
      }
    });
  }

  onSave() {
    if (!this.selectedCycle.name || !this.selectedCycle.code) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill in all required fields',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.isEditMode) {
      const idx = this.cycles.findIndex((c) => c.id === this.selectedCycle.id);
      if (idx !== -1) this.cycles[idx] = { ...this.selectedCycle };
    } else {
      const newId = this.cycles.length ? Math.max(...this.cycles.map((c) => c.id)) + 1 : 1;
      this.cycles.push({ ...this.selectedCycle, id: newId });
      
      // Go to last page to show the new item
      const totalPages = Math.ceil(this.totalRecords / this.pageSize);
      this.currentPage = totalPages;
    }

    this.closeModal();
  }

  private getEmptyCycle(): CycleItem {
    return { id: 0, name: '', code: '' };
  }

  private openModal() {
    const modalElement = document.getElementById('cycleModal');
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }

  private closeModal() {
    const modalElement = document.getElementById('cycleModal');
    const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();
  }
}
