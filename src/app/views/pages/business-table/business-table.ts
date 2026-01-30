import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import Swal from 'sweetalert2';


export interface BusinessItem {
  bizId: number;
  businessName: string;
  owner: string;
  status: boolean;
  plan: string;
  revenue: number;
  verified: boolean;
  createdOn: string;
}

@Component({
  selector: 'app-business-table',
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './business-table.html',
  styleUrl: './business-table.scss'
})
export class BusinessTable {
  businesses: BusinessItem[] = [
    {
      bizId: 101,
      businessName: 'Tech Solutions Inc.',
      owner: 'John Smith',
      status: true,
      plan: 'Premium',
      revenue: 150000,
      verified: true,
      createdOn: '2024-01-15'
    },
    {
      bizId: 102,
      businessName: 'Digital Marketing Pro',
      owner: 'Sarah Johnson',
      status: true,
      plan: 'Basic',
      revenue: 75000,
      verified: false,
      createdOn: '2024-01-20'
    },
    {
      bizId: 103,
      businessName: 'E-Commerce Store',
      owner: 'Mike Wilson',
      status: false,
      plan: 'Enterprise',
      revenue: 250000,
      verified: true,
      createdOn: '2024-01-25'
    },
    {
      bizId: 104,
      businessName: 'Creative Agency',
      owner: 'Emily Davis',
      status: true,
      plan: 'Premium',
      revenue: 120000,
      verified: true,
      createdOn: '2024-02-01'
    },
    {
      bizId: 105,
      businessName: 'Software Development Co.',
      owner: 'Robert Brown',
      status: true,
      plan: 'Custom',
      revenue: 300000,
      verified: false,
      createdOn: '2024-02-05'
    },
    {
      bizId: 106,
      businessName: 'Consulting Group',
      owner: 'Lisa Anderson',
      status: false,
      plan: 'Basic',
      revenue: 45000,
      verified: true,
      createdOn: '2024-02-10'
    },
    {
      bizId: 107,
      businessName: 'Retail Chain',
      owner: 'David Martinez',
      status: true,
      plan: 'Enterprise',
      revenue: 500000,
      verified: true,
      createdOn: '2024-02-15'
    },
    {
      bizId: 108,
      businessName: 'Food Delivery Service',
      owner: 'Jennifer Taylor',
      status: true,
      plan: 'Premium',
      revenue: 95000,
      verified: false,
      createdOn: '2024-02-20'
    }
  ];

  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  selectedBusiness: BusinessItem = this.getEmptyBusiness();
  isEditMode: boolean = false;

  // Statistics getters
  get totalBusinesses(): number {
    return this.businesses.length;
  }

  get verifiedBusinesses(): number {
    return this.businesses.filter(b => b.verified).length;
  }

  get activeBusinesses(): number {
    return this.businesses.filter(b => b.status).length;
  }

  get totalRevenue(): number {
    return this.businesses.reduce((sum, b) => sum + b.revenue, 0);
  }

  constructor() {
    this.totalRecords = this.businesses.length;
  }

  get paginatedBusinesses(): BusinessItem[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.businesses.slice(startIndex, endIndex);
  }

  onPageChange(event: { page: number; pageSize: number }) {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
  }

  onAddNew() {
    this.selectedBusiness = this.getEmptyBusiness();
    this.isEditMode = false;
    this.openModal();
  }

  onEdit(business: BusinessItem) {
    this.selectedBusiness = { ...business };
    this.isEditMode = true;
    this.openModal();
  }

  onDelete(business: BusinessItem, index: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${business.businessName}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result: any) => {
      if (result.isConfirmed) {
        // Find the actual index based on business ID to avoid pagination issues
        const actualIndex = this.businesses.findIndex(b => b.bizId === business.bizId);
        if (actualIndex !== -1) {
          this.businesses.splice(actualIndex, 1);
          this.totalRecords = this.businesses.length;
          
          // Adjust current page if necessary
          const totalPages = Math.ceil(this.totalRecords / this.pageSize);
          if (this.currentPage > totalPages && totalPages > 0) {
            this.currentPage = totalPages;
          }
          
          Swal.fire({
            title: 'Deleted!',
            text: `${business.businessName} has been deleted successfully.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        }
      }
    });
  }

  onStatusChange(business: BusinessItem) {
    // Handle status change logic
    console.log(`Business ${business.businessName} status changed to: ${business.status}`);
  }

  onSaveBusiness() {
    if (!this.selectedBusiness.businessName || !this.selectedBusiness.owner) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill in all required fields',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.isEditMode) {
      // Update existing business
      const index = this.businesses.findIndex(b => b.bizId === this.selectedBusiness.bizId);
      if (index !== -1) {
        this.businesses[index] = { ...this.selectedBusiness };
      }
    } else {
      // Add new business
      const newId = Math.max(...this.businesses.map(b => b.bizId)) + 1;
      const newBusiness: BusinessItem = {
        ...this.selectedBusiness,
        bizId: newId,
        status: true
      };
      this.businesses.push(newBusiness);
      this.totalRecords = this.businesses.length;
      
      // Go to last page to show the new item
      const totalPages = Math.ceil(this.totalRecords / this.pageSize);
      this.currentPage = totalPages;
    }

    this.closeModal();
  }

  private getEmptyBusiness(): BusinessItem {
    return {
      bizId: 0,
      businessName: '',
      owner: '',
      status: true,
      plan: 'Basic',
      revenue: 0,
      verified: false,
      createdOn: new Date().toISOString().split('T')[0],
    };
  }

  private openModal() {
    const modalElement = document.getElementById('businessModal');
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }

  private closeModal() {
    const modalElement = document.getElementById('businessModal');
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.hide();
  }
}
