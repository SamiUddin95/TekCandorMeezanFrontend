import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import Swal from 'sweetalert2';
import { Userservice } from '@/app/services/user.service';
import { OnInit } from '@angular/core';
import { HubListResponse } from '@/app/services/hub.service';
import { BranchListResponse } from '@/app/services/branch.service';
import { FilterService } from '@/app/services/filter.service';

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
  hubIds: number[];  // For multi-select hubs
  branchIds: number[];  // For multi-select branches
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
export class UserManagement implements OnInit {


  users: UserItem[] = [

  ];
  isSelectingGroup: boolean = false;

  selectedSecurityGroups: any[] = [];
  allSecurityGroups: any[] = [];
  tempSelectedGroups: any[] = [];
  //   selectedSecurityGroups: any[] = [];
  // allSecurityGroups: any[] = [];
  // tempSelectedGroups: any[] = [];
  hubs: any;
  isLoading: boolean | undefined;
  subscriptions: any;
  totalPages: number | undefined;
  branches: any;
selectedHubId: any;
highlightedIndex: any;
  // hubs: any;




  ngOnInit(): void {
    this.loadUsers();
    this.loadBranches();
    this.loadHubs();

  }

  currentGroupPage: number = 1;
  groupPageSize: number = 10;
  totalGroupRecords: number = 0;
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

  constructor(private userService: Userservice, private filterService: FilterService) {
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
  //   openSecurityModal() {
  //   const modal = new bootstrap.Modal(document.getElementById('securityGroupModal')!);
  //   modal.show();
  // }



  onGroupSelect(event: any, group: any) {
    if (event.target.checked) {
      this.tempSelectedGroups.push(group);
    } else {
      this.tempSelectedGroups = this.tempSelectedGroups.filter(g => g.id !== group.id);
    }
  }

  saveSelectedGroups() {

    // Duplicate prevent
    this.tempSelectedGroups.forEach(group => {
      const exists = this.selectedSecurityGroups.find(g => g.id === group.id);
      if (!exists) {
        this.selectedSecurityGroups.push(group);
      }
    });

    this.tempSelectedGroups = [];
    this.closeModal();
  }

  removeGroup(index: number) {
    this.selectedSecurityGroups.splice(index, 1);
  }

  onPageChange(event: { page: number; pageSize: number }) {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
    this.loadUsers();
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

  // onDelete(user: UserItem, index: number) {
  //   Swal.fire({
  //     title: 'Are you sure?',
  //     text: `Do you want to delete ${user.name}? This action cannot be undone.`,
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#d33',
  //     cancelButtonColor: '#3085d6',
  //     confirmButtonText: 'Yes, delete it!',
  //     cancelButtonText: 'Cancel'
  //   }).then((result: any) => {
  //     if (result.isConfirmed) {
  //       // Find the actual index based on user ID to avoid pagination issues
  //       const actualIndex = this.users.findIndex(u => u.id === user.id);
  //       if (actualIndex !== -1) {
  //         this.users.splice(actualIndex, 1);
  //         this.totalRecords = this.users.length;

  //         // Adjust current page if necessary
  //         const totalPages = Math.ceil(this.totalRecords / this.pageSize);
  //         if (this.currentPage > totalPages && totalPages > 0) {
  //           this.currentPage = totalPages;
  //         }

  //         Swal.fire({
  //           title: 'Deleted!',
  //           text: `${user.name} has been deleted successfully.`,
  //           icon: 'success',
  //           timer: 2000,
  //           showConfirmButton: false
  //         });
  //       }
  //     }
  //   });
  // }
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

        this.userService.deleteUser(user.id).subscribe({
          next: () => {

            // Find actual index
            const actualIndex = this.users.findIndex(u => u.id === user.id);

            if (actualIndex !== -1) {
              this.users.splice(actualIndex, 1);

              // Update total records
              this.totalRecords--;

              // Calculate total pages
              const totalPages = Math.ceil(this.totalRecords / this.pageSize);

              // Adjust current page if last item of page deleted
              if (this.currentPage > totalPages && totalPages > 0) {
                this.currentPage = totalPages;
              }

              // Reload data for pagination
              this.loadUsers();
            }

            Swal.fire({
              title: 'Deleted!',
              text: `${user.name} has been deleted successfully.`,
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });

          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete user'
            });
          }
        });

      }

    });
  }

  onStatusChange(user: UserItem) {
    console.log(`Status changed for ${user.name}: ${user.status}`);
  }


  loadHubs() {
    this.isLoading = true;
    const subscription = this.userService.getHubs(this.currentPage, this.pageSize).subscribe({
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
      error: (error: any) => {
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
  loadBranches() {
    debugger
    this.isLoading = true;
    const subscription = this.userService.getBranches(this.currentPage, this.pageSize).subscribe({
      next: (response: BranchListResponse) => {
        if (response.status === 'success') {
          this.branches = response.data.items;
          console.log("Branches loaded:", this.branches);
          this.totalRecords = response.data.totalCount;
          this.totalPages = response.data.totalPages;
        } else {
          this.subscriptions.push(subscription);
        }

      }
    })
  };
  

  loadUsers() {
    this.userService.getAllUsers(this.currentPage, this.pageSize)
      .subscribe({
        next: (res: any) => {
          console.log("API Response:", res);


          this.users = res.data.items;
          console.log("Users loaded waleed:", this.users);
          this.totalRecords = res.data.totalCount;


        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'Failed to load users', 'error');
        }
      });
  }

  onSaveUser() {
    // Validation
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
      // Update existing user via API
      this.userService.updateUser(this.selectedUser.id!, this.selectedUser).subscribe({
        next: (res) => {
          Swal.fire('Success', 'User updated successfully', 'success');
          // Update local array
          const index = this.users.findIndex(u => u.id === this.selectedUser.id);
          if (index !== -1) this.users[index] = { ...this.selectedUser };
          this.closeModal();
        },
        error: (err) => Swal.fire('Error', 'Failed to update user', 'error')
      });
    } else {
      // Add new user via API
      this.userService.addUser(this.selectedUser).subscribe({
        next: (res) => {
          Swal.fire('Success', 'User added successfully', 'success');
          // Add new user to local array with id from backend
          const newUser = { ...this.selectedUser, id: res.data?.id || Math.max(...this.users.map(u => u.id)) + 1 };
          this.users.push(newUser);
          this.totalRecords = this.users.length;

          // Go to last page to show new item
          this.currentPage = Math.ceil(this.totalRecords / this.pageSize);
          this.closeModal();
        },
        error: (err) => Swal.fire('Error', 'Failed to add user', 'error')
      });
    }
  }
  loadSecurityGroups() {
    this.userService.getAllGroups(this.currentGroupPage, this.groupPageSize)
      .subscribe({
        next: (res: any) => {

          console.log("Group API Response:", res);

          this.allSecurityGroups = res.data.items;
          this.totalGroupRecords = res.data.totalCount;

        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'Failed to load security groups', 'error');
        }
      });
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
      hubIds: [],  // Initialize empty array for multi-select
      branchIds: [],  // Initialize empty array for multi-select
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

  // Multi-select methods for hubs
  onHubSelectionChange(event: any, hubId: number) {
    if (event.target.checked) {
      // Add hub to selection
      if (!this.selectedUser.hubIds.includes(hubId)) {
        this.selectedUser.hubIds.push(hubId);
      }
    } else {
      // Remove hub from selection
      this.selectedUser.hubIds = this.selectedUser.hubIds.filter(id => id !== hubId);
    }
  }

  // Multi-select methods for branches
  onBranchSelectionChange(event: any, branchId: number) {
    if (event.target.checked) {
      // Add branch to selection
      if (!this.selectedUser.branchIds.includes(branchId)) {
        this.selectedUser.branchIds.push(branchId);
      }
    } else {
      // Remove branch from selection
      this.selectedUser.branchIds = this.selectedUser.branchIds.filter(id => id !== branchId);
    }
  }

  // Check if hub is selected
  isHubSelected(hubId: number): boolean {
    return this.selectedUser.hubIds.includes(hubId);
  }

  // Check if branch is selected
  isBranchSelected(branchId: number): boolean {
    return this.selectedUser.branchIds.includes(branchId);
  }

  // Get selected hub names for display
  getSelectedHubNames(): string {
    if (this.selectedUser.hubIds.length === 0) return 'Select Hubs';
    
    const selectedHubNames = this.hubs
      .filter((hub: any) => this.selectedUser.hubIds.includes(hub.id))
      .map((hub: any) => hub.name);
    
    if (selectedHubNames.length === 0) return 'Select Hubs';
    if (selectedHubNames.length === 1) return selectedHubNames[0];
    return `${selectedHubNames.length} Hubs Selected`;
  }

  // Get selected branch names for display
  getSelectedBranchNames(): string {
    if (this.selectedUser.branchIds.length === 0) return 'Select Branches';
    
    const selectedBranchNames = this.branches
      .filter((branch: any) => this.selectedUser.branchIds.includes(branch.id))
      .map((branch: any) => branch.name);
    
    if (selectedBranchNames.length === 0) return 'Select Branches';
    if (selectedBranchNames.length === 1) return selectedBranchNames[0];
    return `${selectedBranchNames.length} Branches Selected`;
  }

  onChangePassword() {
    Swal.fire({
      title: 'Change Password',
      text: 'Password change functionality will be implemented later.',
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }

  openModal() {
    const modalElement = document.getElementById('userModal');
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }

  openSecurityModal() {
    const modalElement = document.getElementById('securityGroupModal');
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


  showGroupSelection() {
    this.isSelectingGroup = true;
    this.loadSecurityGroups();

  }


  cancelSelection() {
    this.isSelectingGroup = false;
    this.tempSelectedGroups = [];
  }

  addSelectedGroups() {

    this.tempSelectedGroups.forEach(group => {
      const exists = this.selectedSecurityGroups.find(g => g.id === group.id);
      if (!exists) {
        this.selectedSecurityGroups.push(group);
      }
    });

    this.isSelectingGroup = false;
    this.tempSelectedGroups = [];
  }

  onCheckboxChange(event: any, group: any) {
    if (event.target.checked) {
      this.tempSelectedGroups.push(group);
    } else {
      this.tempSelectedGroups =
        this.tempSelectedGroups.filter(g => g.id !== group.id);
    }
  }


}

