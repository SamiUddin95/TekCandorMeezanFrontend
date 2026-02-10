import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import Swal from 'sweetalert2';
import { CycleService, CycleItem, CycleListResponse } from '../../../../services/cycle.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cycle',
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './cycle.component.html',
  styleUrl: './cycle.component.scss'
})
export class Cycle implements OnInit {
  searchName = '';
  isEditMode = false;
  currentPage: number = 1;
  pageSize: number = 10;

  cycles: CycleItem[] = [];
  totalRecords: number = 0;
  totalPages: number = 0;
  isLoading: boolean = false;

  selectedCycle: CycleItem = this.getEmptyCycle();
  private subscriptions: Subscription[] = [];

  constructor(private cycleService: CycleService) {}

  ngOnInit() {
    this.loadCycles();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadCycles() {
    this.isLoading = true;
    const subscription = this.cycleService.getCycles(this.currentPage, this.pageSize).subscribe({
      next: (response: CycleListResponse) => {
        if (response.status === 'success') {
          this.cycles = response.data.items;
          this.totalRecords = response.data.totalCount;
          this.totalPages = response.data.totalPages;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.errorMessage || 'Failed to load cycles'
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading cycles:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load cycles. Please try again.'
        });
        this.isLoading = false;
      }
    });
    this.subscriptions.push(subscription);
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
    this.loadCycles();
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
        this.deleteCycle(cycle.id);
      }
    });
  }

  deleteCycle(id: number) {
    const subscription = this.cycleService.deleteCycle(id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          Swal.fire({
            title: 'Deleted!',
            text: 'Cycle has been deleted successfully.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          this.loadCycles(); // Reload the list
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.errorMessage || 'Failed to delete cycle'
          });
        }
      },
      error: (error) => {
        console.error('Error deleting cycle:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete cycle. Please try again.'
        });
      }
    });
    this.subscriptions.push(subscription);
  }

  onSave() {
    if (!this.selectedCycle.code || !this.selectedCycle.name) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill in all required fields',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    const cycleData = {
      code: this.selectedCycle.code,
      name: this.selectedCycle.name
    };

    if (this.isEditMode) {
      this.updateCycle(this.selectedCycle.id, cycleData);
    } else {
      this.createCycle(cycleData);
    }
  }

  createCycle(cycleData: any) {
    const subscription = this.cycleService.createCycle(cycleData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Cycle created successfully!',
            timer: 2000,
            showConfirmButton: false
          });
          this.closeModal();
          this.loadCycles(); // Reload the list
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.errorMessage || 'Failed to create cycle'
          });
        }
      },
      error: (error) => {
        console.error('Error creating cycle:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to create cycle. Please try again.'
        });
      }
    });
    this.subscriptions.push(subscription);
  }

  updateCycle(id: number, cycleData: any) {
    const subscription = this.cycleService.updateCycle(id, cycleData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Cycle updated successfully!',
            timer: 2000,
            showConfirmButton: false
          });
          this.closeModal();
          this.loadCycles(); // Reload the list
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.errorMessage || 'Failed to update cycle'
          });
        }
      },
      error: (error) => {
        console.error('Error updating cycle:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update cycle. Please try again.'
        });
      }
    });
    this.subscriptions.push(subscription);
  }

  private getEmptyCycle(): CycleItem {
    return { 
      id: 0, 
      code: '', 
      name: '', 
      isDeleted: false,
      createdBy: '', 
      updatedBy: '', 
      createdOn: '', 
      updatedOn: null
    };
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
