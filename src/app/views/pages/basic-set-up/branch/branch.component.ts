import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import Swal from 'sweetalert2';
import { BranchService, BranchItem, BranchListResponse } from '../../../../services/branch.service';
import { HubService, HubItem } from '../../../../services/hub.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-branch',
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './branch.component.html',
  styleUrl: './branch.component.scss'
})
export class Branch implements OnInit {
  searchName = '';
  isEditMode = false;
  currentPage: number = 1;
  pageSize: number = 10;

  branches: BranchItem[] = [];
  totalRecords: number = 0;
  totalPages: number = 0;
  isLoading: boolean = false;

  selectedBranch: BranchItem = this.getEmptyBranch();
  hubOptions: HubItem[] = [];
  private subscriptions: Subscription[] = [];

  constructor(private branchService: BranchService, private hubService: HubService) {}

  ngOnInit() {
    this.loadBranches();
    this.loadHubs();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadHubs() {
    const subscription = this.hubService.getHubs(1, 100).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.hubOptions = response.data.items;
        } else {
          console.error('Failed to load hubs:', response.errorMessage);
        }
      },
      error: (error) => {
        console.error('Error loading hubs:', error);
      }
    });
    this.subscriptions.push(subscription);
  }

  loadBranches() {
    this.isLoading = true;
    const subscription = this.branchService.getBranches(this.currentPage, this.pageSize).subscribe({
      next: (response: BranchListResponse) => {
        if (response.status === 'success') {
          this.branches = response.data.items;
          this.totalRecords = response.data.totalCount;
          this.totalPages = response.data.totalPages;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.errorMessage || 'Failed to load branches'
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading branches:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load branches. Please try again.'
        });
        this.isLoading = false;
      }
    });
    this.subscriptions.push(subscription);
  }

  get filteredBranches(): BranchItem[] {
    return this.branches;
  }

  get paginatedBranches(): BranchItem[] {
    return this.branches;
  }

  onPageChange(event: { page: number; pageSize: number }) {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
    this.loadBranches();
  }

  getHubName(hubId: number): string {
    const hub = this.hubOptions.find(h => h.id === hubId);
    return hub ? hub.name : 'Unknown';
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
        this.deleteBranch(branch.id);
      }
    });
  }

  deleteBranch(id: number) {
    const subscription = this.branchService.deleteBranch(id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          Swal.fire({
            title: 'Deleted!',
            text: 'Branch has been deleted successfully.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          this.loadBranches(); // Reload the list
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.errorMessage || 'Failed to delete branch'
          });
        }
      },
      error: (error) => {
        console.error('Error deleting branch:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete branch. Please try again.'
        });
      }
    });
    this.subscriptions.push(subscription);
  }

  onSave() {
    if (!this.selectedBranch.name || !this.selectedBranch.code || !this.selectedBranch.niftBranchCode || !this.selectedBranch.hubId) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill in all required fields',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    const branchData = {
      code: this.selectedBranch.code,
      niftBranchCode: this.selectedBranch.niftBranchCode,
      name: this.selectedBranch.name,
      hubId: this.selectedBranch.hubId,
      email1: this.selectedBranch.email1,
      email2: this.selectedBranch.email2,
      email3: this.selectedBranch.email3
    };

    if (this.isEditMode) {
      this.updateBranch(this.selectedBranch.id, branchData);
    } else {
      this.createBranch(branchData);
    }
  }

  createBranch(branchData: any) {
    const subscription = this.branchService.createBranch(branchData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Branch created successfully!',
            timer: 2000,
            showConfirmButton: false
          });
          this.closeModal();
          this.loadBranches(); // Reload the list
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.errorMessage || 'Failed to create branch'
          });
        }
      },
      error: (error) => {
        console.error('Error creating branch:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to create branch. Please try again.'
        });
      }
    });
    this.subscriptions.push(subscription);
  }

  updateBranch(id: number, branchData: any) {
    const subscription = this.branchService.updateBranch(id, branchData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Branch updated successfully!',
            timer: 2000,
            showConfirmButton: false
          });
          this.closeModal();
          this.loadBranches(); // Reload the list
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.errorMessage || 'Failed to update branch'
          });
        }
      },
      error: (error) => {
        console.error('Error updating branch:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update branch. Please try again.'
        });
      }
    });
    this.subscriptions.push(subscription);
  }

  private getEmptyBranch(): BranchItem {
    return { 
      id: 0, 
      code: '', 
      niftBranchCode: '',
      name: '', 
      hubId: 1,
      isDeleted: false,
      createdBy: null,
      updatedBy: null,
      createdOn: null,
      updatedOn: null,
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
