import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import Swal from 'sweetalert2';

interface ReturnReasonItem {
  id: number;
  code: string;
  numericReturnCodes: string;
  name: string;
  defaultCallBack: boolean;
}

@Component({
  selector: 'app-return-reason',
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './return-reason.component.html',
  styleUrl: './return-reason.component.scss'
})
export class ReturnReason {
  searchName = '';
  isEditMode = false;
  currentPage: number = 1;
  pageSize: number = 10;

  returnReasons: ReturnReasonItem[] = [
    { id: 1, code: 'RR-001', numericReturnCodes: 'NIFT-001', name: 'Insufficient Funds', defaultCallBack: true },
    { id: 2, code: 'RR-002', numericReturnCodes: 'NIFT-002', name: 'Account Closed', defaultCallBack: false },
    { id: 3, code: 'RR-003', numericReturnCodes: 'NIFT-003', name: 'Stop Payment', defaultCallBack: true },
    { id: 4, code: 'RR-004', numericReturnCodes: 'NIFT-004', name: 'Signature Mismatch', defaultCallBack: false },
    { id: 5, code: 'RR-005', numericReturnCodes: 'NIFT-005', name: 'Post Dated Cheque', defaultCallBack: true },
    { id: 6, code: 'RR-006', numericReturnCodes: 'NIFT-006', name: 'Amount in Words Mismatch', defaultCallBack: false },
    { id: 7, code: 'RR-007', numericReturnCodes: 'NIFT-007', name: 'Stale Cheque', defaultCallBack: true },
    { id: 8, code: 'RR-008', numericReturnCodes: 'NIFT-008', name: 'Alteration Required', defaultCallBack: false },
    { id: 9, code: 'RR-009', numericReturnCodes: 'NIFT-009', name: 'Exceeds Limit', defaultCallBack: true },
    { id: 10, code: 'RR-010', numericReturnCodes: 'NIFT-010', name: 'Frozen Account', defaultCallBack: false },
    { id: 11, code: 'RR-011', numericReturnCodes: 'NIFT-011', name: 'Invalid Account', defaultCallBack: true },
    { id: 12, code: 'RR-012', numericReturnCodes: 'NIFT-012', name: 'Clearing Issues', defaultCallBack: false },
  ];

  selectedReturnReason: ReturnReasonItem = this.getEmptyReturnReason();

  constructor() {
    // Total records will be updated dynamically based on filtered data
  }

  get totalRecords(): number {
    return this.filteredReturnReasons.length;
  }

  get filteredReturnReasons(): ReturnReasonItem[] {
    const q = this.searchName.trim().toLowerCase();
    if (!q) return this.returnReasons;
    return this.returnReasons.filter((rr) => rr.name.toLowerCase().includes(q));
  }

  get paginatedReturnReasons(): ReturnReasonItem[] {
    if (!this.filteredReturnReasons || this.filteredReturnReasons.length === 0) {
      return [];
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredReturnReasons.slice(startIndex, endIndex);
  }

  onPageChange(event: { page: number; pageSize: number }) {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
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
        const actualIndex = this.returnReasons.findIndex(rr => rr.id === returnReason.id);
        if (actualIndex !== -1) {
          this.returnReasons.splice(actualIndex, 1);
          
          // Adjust current page if necessary
          const totalPages = Math.ceil(this.totalRecords / this.pageSize);
          if (this.currentPage > totalPages && totalPages > 0) {
            this.currentPage = totalPages;
          }
          
          Swal.fire({
            title: 'Deleted!',
            text: `${returnReason.name} has been deleted successfully.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        }
      }
    });
  }

  onSave() {
    if (!this.selectedReturnReason.code || !this.selectedReturnReason.numericReturnCodes || !this.selectedReturnReason.name) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill in all required fields',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.isEditMode) {
      const idx = this.returnReasons.findIndex((rr) => rr.id === this.selectedReturnReason.id);
      if (idx !== -1) this.returnReasons[idx] = { ...this.selectedReturnReason };
    } else {
      const newId = this.returnReasons.length ? Math.max(...this.returnReasons.map((rr) => rr.id)) + 1 : 1;
      this.returnReasons.push({ ...this.selectedReturnReason, id: newId });
      
      // Go to last page to show the new item
      const totalPages = Math.ceil(this.totalRecords / this.pageSize);
      this.currentPage = totalPages;
    }

    this.closeModal();
  }

  private getEmptyReturnReason(): ReturnReasonItem {
    return { 
      id: 0, 
      code: '', 
      numericReturnCodes: '', 
      name: '', 
      defaultCallBack: false 
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
