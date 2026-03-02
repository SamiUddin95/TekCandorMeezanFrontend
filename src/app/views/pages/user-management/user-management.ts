import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import Swal from 'sweetalert2';

export interface UserItem {
  id: number;
  name: string;
  email: string;
  loginName: string;
  phone: string;
  lastLoginTime: string;
  branchOrHub: string;
  hubId: number;
  branchId: number;
  group: string;
  active: boolean;
  loginPassword: string;
  role: string;
  avatar: string;
  status: boolean;
  verified: boolean;
  joinedOn: string;
  lastActive: string;
  reports: number;
  adminNotes?: string;  // Optional admin notes
  uploadedAvatar?: string;  // For uploaded image data
}

@Component({
  selector: 'app-user-management',
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss'
})
export class UserManagement {
  users: UserItem[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      loginName: 'johndoe',
      phone: '+1234567890',
      lastLoginTime: '2024-01-24 10:30 AM',
      branchOrHub: 'hubWise',
      hubId: 1,
      branchId: 0,
      group: 'admin',
      active: true,
      loginPassword: 'password123',
      role: 'admin',
      avatar: '/assets/images/users/user-2.jpg',
      status: true,
      verified: true,
      joinedOn: '2024-01-15',
      lastActive: '2024-01-24',
      reports: 0
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      loginName: 'janesmith',
      phone: '+1234567891',
      lastLoginTime: '2024-01-23 2:15 PM',
      branchOrHub: 'branchWise',
      hubId: 0,
      branchId: 1,
      group: 'operator',
      active: true,
      loginPassword: 'password123',
      role: 'user',
      avatar: '/assets/images/users/user-2.jpg',
      status: true,
      verified: true,
      joinedOn: '2024-01-10',
      lastActive: '2024-01-23',
      reports: 1
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      loginName: 'mikejohnson',
      phone: '+1234567892',
      lastLoginTime: '2024-01-20 4:45 PM',
      branchOrHub: 'hubWise',
      hubId: 2,
      branchId: 0,
      group: 'supervisor',
      active: false,
      loginPassword: 'password123',
      role: 'moderator',
      avatar: '/assets/images/users/user-2.jpg',
      status: false,
      verified: false,
      joinedOn: '2024-01-05',
      lastActive: '2024-01-20',
      reports: 3
    },
    {
      id: 4,
      name: 'Sarah Williams',
      email: 'sarah.williams@example.com',
      loginName: 'sarahwilliams',
      phone: '+1234567893',
      lastLoginTime: '2024-01-24 9:00 AM',
      branchOrHub: 'branchWise',
      hubId: 0,
      branchId: 2,
      group: 'viewer',
      active: true,
      loginPassword: 'password123',
      role: 'user',
      avatar: '/assets/images/users/user-2.jpg',
      status: true,
      verified: true,
      joinedOn: '2023-12-28',
      lastActive: '2024-01-24',
      reports: 0
    },
    {
      id: 5,
      name: 'David Brown',
      email: 'david.brown@example.com',
      loginName: 'davidbrown',
      phone: '+1234567894',
      lastLoginTime: '2024-01-22 3:30 PM',
      branchOrHub: 'hubWise',
      hubId: 3,
      branchId: 0,
      group: 'admin',
      active: false,
      loginPassword: 'password123',
      role: 'admin',
      avatar: '/assets/images/users/user-2.jpg',
      status: false,
      verified: true,
      joinedOn: '2023-12-20',
      lastActive: '2024-01-22',
      reports: 2
    },
    {
      id: 6,
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      loginName: 'emilydavis',
      phone: '+1234567895',
      lastLoginTime: '2024-01-21 11:45 AM',
      branchOrHub: 'branchWise',
      hubId: 0,
      branchId: 3,
      group: 'operator',
      active: true,
      loginPassword: 'password123',
      role: 'user',
      avatar: '/assets/images/users/user-2.jpg',
      status: true,
      verified: false,
      joinedOn: '2023-12-15',
      lastActive: '2024-01-21',
      reports: 1
    },
    {
      id: 7,
      name: 'Chris Wilson',
      email: 'chris.wilson@example.com',
      loginName: 'chriswilson',
      phone: '+1234567896',
      lastLoginTime: '2024-01-24 1:15 PM',
      branchOrHub: 'hubWise',
      hubId: 4,
      branchId: 0,
      group: 'supervisor',
      active: true,
      loginPassword: 'password123',
      role: 'moderator',
      avatar: '/assets/images/users/user-2.jpg',
      status: true,
      verified: true,
      joinedOn: '2023-12-10',
      lastActive: '2024-01-24',
      reports: 0
    },
    {
      id: 8,
      name: 'Lisa Anderson',
      email: 'lisa.anderson@example.com',
      loginName: 'lisaanderson',
      phone: '+1234567897',
      lastLoginTime: '2024-01-18 2:00 PM',
      branchOrHub: 'branchWise',
      hubId: 0,
      branchId: 4,
      group: 'viewer',
      active: false,
      loginPassword: 'password123',
      role: 'user',
      avatar: '/assets/images/users/user-2.jpg',
      status: false,
      verified: false,
      joinedOn: '2023-12-05',
      lastActive: '2024-01-18',
      reports: 4
    },
    {
      id: 9,
      name: 'Tom Martinez',
      email: 'tom.martinez@example.com',
      loginName: 'tommartinez',
      phone: '+1234567898',
      lastLoginTime: '2024-01-23 10:45 AM',
      branchOrHub: 'hubWise',
      hubId: 1,
      branchId: 0,
      group: 'operator',
      active: true,
      loginPassword: 'password123',
      role: 'user',
      avatar: '/assets/images/users/user-2.jpg',
      status: true,
      verified: true,
      joinedOn: '2023-11-28',
      lastActive: '2024-01-23',
      reports: 0
    },
    {
      id: 10,
      name: 'Amy Taylor',
      email: 'amy.taylor@example.com',
      loginName: 'amytaylor',
      phone: '+1234567899',
      lastLoginTime: '2024-01-24 4:30 PM',
      branchOrHub: 'hubWise',
      hubId: 2,
      branchId: 0,
      group: 'admin',
      active: true,
      loginPassword: 'password123',
      role: 'admin',
      avatar: '/assets/images/users/user-2.jpg',
      status: true,
      verified: true,
      joinedOn: '2023-11-20',
      lastActive: '2024-01-24',
      reports: 1
    },
    {
      id: 11,
      name: 'Robert Garcia',
      email: 'robert.garcia@example.com',
      loginName: 'robertgarcia',
      phone: '+1234567900',
      lastLoginTime: '2024-01-19 1:00 PM',
      branchOrHub: 'branchWise',
      hubId: 0,
      branchId: 1,
      group: 'viewer',
      active: false,
      loginPassword: 'password123',
      role: 'user',
      avatar: '/assets/images/users/user-2.jpg',
      status: false,
      verified: false,
      joinedOn: '2023-11-15',
      lastActive: '2024-01-19',
      reports: 2
    },
    {
      id: 12,
      name: 'Michelle Lee',
      email: 'michelle.lee@example.com',
      loginName: 'michellelee',
      phone: '+1234567901',
      lastLoginTime: '2024-01-24 11:00 AM',
      branchOrHub: 'hubWise',
      hubId: 3,
      branchId: 0,
      group: 'supervisor',
      active: true,
      loginPassword: 'password123',
      role: 'moderator',
      avatar: '/assets/images/users/user-2.jpg',
      status: true,
      verified: true,
      joinedOn: '2023-11-10',
      lastActive: '2024-01-24',
      reports: 0
    }
  ];

  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  previewImage: string = '';
  selectedUser: UserItem = this.getEmptyUser();
  isEditMode: boolean = false;

  // Statistics properties
  get totalUsers(): number {
    return this.users.length;
  }

  get verifiedUsers(): number {
    return this.users.filter(u => u.verified).length;
  }

  get activeUsers(): number {
    return this.users.filter(u => u.status).length;
  }

  get totalReports(): number {
    return this.users.reduce((sum, u) => sum + u.reports, 0);
  }

  constructor() {
    this.totalRecords = this.users.length;
  }

  get paginatedUsers(): UserItem[] {
    if (!this.users || this.users.length === 0) {
      return [];
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.users.slice(startIndex, endIndex);
  }

  onPageChange(event: { page: number; pageSize: number }) {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
  }

  onAddNew() {
    this.selectedUser = this.getEmptyUser();
    this.isEditMode = false;
    this.openModal();
  }

  onEdit(user: UserItem) {
    this.selectedUser = { ...user };
    this.isEditMode = true;
    this.openModal();
  }

  onDelete(user: UserItem, index: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${user.name}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result: any) => {
      if (result.isConfirmed) {
        // Find the actual index based on user ID to avoid pagination issues
        const actualIndex = this.users.findIndex(u => u.id === user.id);
        if (actualIndex !== -1) {
          this.users.splice(actualIndex, 1);
          this.totalRecords = this.users.length;
          
          // Adjust current page if necessary
          const totalPages = Math.ceil(this.totalRecords / this.pageSize);
          if (this.currentPage > totalPages && totalPages > 0) {
            this.currentPage = totalPages;
          }
          
          Swal.fire({
            title: 'Deleted!',
            text: `${user.name} has been deleted successfully.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        }
      }
    });
  }

  onStatusChange(user: UserItem) {
    console.log(`Status changed for ${user.name}: ${user.status}`);
  }

  onSaveUser() {
    if (!this.selectedUser.name || !this.selectedUser.email) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill in all required fields',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.isEditMode) {
      // Update existing user
      const index = this.users.findIndex(u => u.id === this.selectedUser.id);
      if (index !== -1) {
        this.users[index] = { ...this.selectedUser };
      }
    } else {
      // Add new user
      const newId = Math.max(...this.users.map(u => u.id)) + 1;
      const newUser: UserItem = {
        ...this.selectedUser,
        id: newId,
        status: true
      };
      this.users.push(newUser);
      this.totalRecords = this.users.length;
      
      // Go to last page to show the new item
      const totalPages = Math.ceil(this.totalRecords / this.pageSize);
      this.currentPage = totalPages;
    }

    this.closeModal();
  }

  showImagePreview(avatarUrl: string) {
    this.previewImage = avatarUrl;
    const modalElement = document.getElementById('imagePreviewModal');
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }

  onAvatarUpload(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedUser.avatar = e.target.result;
        this.selectedUser.uploadedAvatar = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerAvatarUpload() {
    document.getElementById('avatarUpload')?.click();
  }

  private getEmptyUser(): UserItem {
    return {
      id: 0,
      name: '',
      email: '',
      loginName: '',
      phone: '',
      lastLoginTime: '',
      branchOrHub: 'branchWise',
      hubId: 0,
      branchId: 0,
      group: '',
      active: true,
      loginPassword: '',
      role: 'user',
      avatar: '/assets/images/users/user-2.jpg',
      status: true,
      verified: false,
      joinedOn: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      reports: 0,
      adminNotes: ''
    };
  }

  onChangePassword() {
    Swal.fire({
      title: 'Change Password',
      text: 'Password change functionality will be implemented later.',
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }

  private openModal() {
    const modalElement = document.getElementById('userModal');
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }

  private closeModal() {
    const modalElement = document.getElementById('userModal');
    const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }
  }
}
