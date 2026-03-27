import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import Swal from 'sweetalert2';
import { ReturnReasonService, ReturnReasonItem, ReturnReasonListResponse } from '../../../../services/return-reason.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-return-reason',
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './return-reason.component.html',
  styleUrl: './return-reason.component.scss'
})
export class ReturnReason implements OnInit {
  searchName = '';
  isEditMode = false;
  currentPage: number = 1;
  pageSize: number = 10;

  returnReasons: ReturnReasonItem[] = [];
  totalRecords: number = 0;
  totalPages: number = 0;
  isLoading: boolean = false;

  selectedReturnReason: ReturnReasonItem = this.getEmptyReturnReason();
  private subscriptions: Subscription[] = [];

  constructor(private returnReasonService: ReturnReasonService) {}

  ngOnInit() {
    this.loadReturnReasons();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadReturnReasons() {
    this.isLoading = true;
    const subscription = this.returnReasonService.getReturnReasons(this.currentPage, this.pageSize).subscribe({
      next: (response: ReturnReasonListResponse) => {
        if (response.status === 'success') {
          this.returnReasons = response.data.items;
          this.totalRecords = response.data.totalCount;
          this.totalPages = response.data.totalPages;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.errorMessage || 'Failed to load return reasons'
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading return reasons:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load return reasons. Please try again.'
        });
        this.isLoading = false;
      }
    });
    this.subscriptions.push(subscription);
  }

  get filteredReturnReasons(): ReturnReasonItem[] {
    return this.returnReasons;
  }

  get paginatedReturnReasons(): ReturnReasonItem[] {
    return this.returnReasons;
  }

  onPageChange(event: { page: number; pageSize: number }) {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
    this.loadReturnReasons();
  }

  onAddNew() {
    this.selectedReturnReason = this.getEmptyReturnReason();
    this.isEditMode = false;
    this.openModal();
  }

  onEdit(returnReason: ReturnReasonItem) {
    this.selectedReturnReason = { ...returnReason };
    this.isEditMode = true;
    this.openModal();
  }

  onDelete(returnReason: ReturnReasonItem) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${returnReason.name}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.deleteReturnReason(returnReason.id);
      }
    });
  }

  deleteReturnReason(id: number) {
    const subscription = this.returnReasonService.deleteReturnReason(id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          Swal.fire({
            title: 'Deleted!',
            text: 'Return reason has been deleted successfully.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          this.loadReturnReasons(); // Reload the list
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.errorMessage || 'Failed to delete return reason'
          });
        }
      },
      error: (error) => {
        console.error('Error deleting return reason:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete return reason. Please try again.'
        });
      }
    });
    this.subscriptions.push(subscription);
  }

  onSave() {
    if (!this.selectedReturnReason.code || !this.selectedReturnReason.alphaReturnCodes || !this.selectedReturnReason.numericReturnCodes || !this.selectedReturnReason.name) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill in all required fields',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    const returnReasonData = {
      code: this.selectedReturnReason.code,
      alphaReturnCodes: this.selectedReturnReason.alphaReturnCodes,
      numericReturnCodes: this.selectedReturnReason.numericReturnCodes,
      descriptionWithReturnCodes: this.selectedReturnReason.descriptionWithReturnCodes,
      defaultCallBack: this.selectedReturnReason.defaultCallBack,
      name: this.selectedReturnReason.name
    };

    if (this.isEditMode) {
      this.updateReturnReason(this.selectedReturnReason.id, returnReasonData);
    } else {
      this.createReturnReason(returnReasonData);
    }
  }

  createReturnReason(returnReasonData: any) {
    const subscription = this.returnReasonService.createReturnReason(returnReasonData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Return reason created successfully!',
            timer: 2000,
            showConfirmButton: false
          });
          this.closeModal();
          this.loadReturnReasons(); // Reload the list
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.errorMessage || 'Failed to create return reason'
          });
        }
      },
      error: (error) => {
        console.error('Error creating return reason:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to create return reason. Please try again.'
        });
      }
    });
    this.subscriptions.push(subscription);
  }

  updateReturnReason(id: number, returnReasonData: any) {
    const subscription = this.returnReasonService.updateReturnReason(id, returnReasonData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Return reason updated successfully!',
            timer: 2000,
            showConfirmButton: false
          });
          this.closeModal();
          this.loadReturnReasons(); // Reload the list
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.errorMessage || 'Failed to update return reason'
          });
        }
      },
      error: (error) => {
        console.error('Error updating return reason:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update return reason. Please try again.'
        });
      }
    });
    this.subscriptions.push(subscription);
  }

  private getEmptyReturnReason(): ReturnReasonItem {
    return { 
      id: 0, 
      code: '', 
      alphaReturnCodes: '',
      numericReturnCodes: '', 
      descriptionWithReturnCodes: '',
      defaultCallBack: false,
      name: '',
      isDeleted: false,
      createdBy: null,
      updatedBy: null,
      createdOn: null,
      updatedOn: null
    };
  }

  private openModal() {
    const modalElement = document.getElementById('returnReasonModal');
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }

  private closeModal() {
    const modalElement = document.getElementById('returnReasonModal');
    const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();
  }
}
