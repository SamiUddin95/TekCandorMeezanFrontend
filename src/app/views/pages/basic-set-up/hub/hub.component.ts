import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import Swal from 'sweetalert2';
import { HubService, HubItem, HubListResponse } from '../../../../services/hub.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-hub',
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './hub.component.html',
  styleUrl: './hub.component.scss'
})
export class Hub implements OnInit {
  searchName = '';
  isEditMode = false;
  currentPage: number = 1;
  pageSize: number = 10;

  hubs: HubItem[] = [];
  totalRecords: number = 0;
  totalPages: number = 0;
  isLoading: boolean = false;

  selectedHub: HubItem = this.getEmptyHub();
  private subscriptions: Subscription[] = [];

  constructor(private hubService: HubService) {}

  ngOnInit() {
    this.loadHubs();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadHubs() {
    this.isLoading = true;
    const subscription = this.hubService.getHubs(this.currentPage, this.pageSize).subscribe({
      next: (response: HubListResponse) => {
        if (response.status === 'success') {
          this.hubs = response.data.items;
          this.totalRecords = response.data.totalCount;
          this.totalPages = response.data.totalPages;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.errorMessage || 'Failed to load hubs'
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading hubs:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load hubs. Please try again.'
        });
        this.isLoading = false;
      }
    });
    this.subscriptions.push(subscription);
  }

  get filteredHubs(): HubItem[] {
    return this.hubs;
  }

  get paginatedHubs(): HubItem[] {
     return this.hubs;
  }

  onPageChange(event: { page: number; pageSize: number }) {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
    this.loadHubs();
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
        this.deleteHub(hub.id);
      }
    });
  }

  deleteHub(id: number) {
    const subscription = this.hubService.deleteHub(id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          Swal.fire({
            title: 'Deleted!',
            text: 'Hub has been deleted successfully.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          this.loadHubs(); // Reload the list
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.errorMessage || 'Failed to delete hub'
          });
        }
      },
      error: (error) => {
        console.error('Error deleting hub:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete hub. Please try again.'
        });
      }
    });
    this.subscriptions.push(subscription);
  }

  onSave() {
    if (!this.selectedHub.code || !this.selectedHub.name || !this.selectedHub.crAccSameDay || !this.selectedHub.crAccNormal || !this.selectedHub.crAccIntercity || !this.selectedHub.crAccDollar) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill in all required fields',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    const hubData = {
      code: this.selectedHub.code,
      name: this.selectedHub.name,
      crAccSameDay: this.selectedHub.crAccSameDay,
      crAccNormal: this.selectedHub.crAccNormal,
      crAccIntercity: this.selectedHub.crAccIntercity,
      crAccDollar: this.selectedHub.crAccDollar
    };

    if (this.isEditMode) {
      this.updateHub(this.selectedHub.id, hubData);
    } else {
      this.createHub(hubData);
    }
  }

  createHub(hubData: any) {
    const subscription = this.hubService.createHub(hubData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Hub created successfully!',
            timer: 2000,
            showConfirmButton: false
          });
          this.closeModal();
          this.loadHubs(); // Reload the list
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.errorMessage || 'Failed to create hub'
          });
        }
      },
      error: (error) => {
        console.error('Error creating hub:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to create hub. Please try again.'
        });
      }
    });
    this.subscriptions.push(subscription);
  }

  updateHub(id: number, hubData: any) {
    const subscription = this.hubService.updateHub(id, hubData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Hub updated successfully!',
            timer: 2000,
            showConfirmButton: false
          });
          this.closeModal();
          this.loadHubs(); // Reload the list
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.errorMessage || 'Failed to update hub'
          });
        }
      },
      error: (error) => {
        console.error('Error updating hub:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update hub. Please try again.'
        });
      }
    });
    this.subscriptions.push(subscription);
  }

  private getEmptyHub(): HubItem {
    return { 
      id: 0, 
      isDeleted: false,
      code: '', 
      name: '', 
      createdBy: '', 
      updatedBy: '', 
      createdOn: '', 
      updatedOn: '', 
      crAccSameDay: '', 
      crAccNormal: '', 
      crAccIntercity: '', 
      crAccDollar: '' 
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
