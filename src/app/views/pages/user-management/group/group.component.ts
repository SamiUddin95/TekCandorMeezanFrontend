import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import Swal from 'sweetalert2';
import { GroupService, GroupItem, PermissionItem, GroupCreateRequest, GroupUpdateRequest, AssignPermissionsRequest } from '../../../../services/group.service';
import { AuthService } from '../../../../services/auth.service';
import { PermissionGuardService } from '../../../../services/permission-guard.service';

export interface Permission {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
}

@Component({
  selector: 'app-group',
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './group.component.html',
  styleUrl: './group.component.scss'
})
export class GroupComponent implements OnInit {
  groups: GroupItem[] = [];
  allPermissions: PermissionItem[] = [];
  isLoading: boolean = false;
  isPermissionsLoading: boolean = false;

  searchName = '';
  isEditMode = false;
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;

  selectedGroup: GroupItem = this.getEmptyGroup();
  selectedPermissions: Permission[] = [];

  constructor(private groupService: GroupService, private authService: AuthService, private permissionGuard: PermissionGuardService) {}

  ngOnInit() {
    this.loadGroups();
    this.loadPermissions();
    this.logUserPermissions();
  }

  // Log user permissions for demonstration
  logUserPermissions() {
    const userPermissions = this.authService.getUserPermissions();
    const tokenClaims = this.authService.getTokenClaims();
    const permissionDisplayNames = this.permissionGuard.getUserPermissionDisplayNames();
    
    console.log('=== USER PERMISSIONS ===');
    console.log('Raw Permissions:', userPermissions);
    console.log('Permission Names:', permissionDisplayNames);
    console.log('Token Claims:', tokenClaims);
    console.log('Can Manage Groups:', this.permissionGuard.canManageGroups());
    console.log('Is Admin:', this.permissionGuard.isAdmin());
    console.log('========================');
    
    // If no permissions found, try to refresh from token
    if (userPermissions.length === 0) {
      console.log('No permissions found, attempting to refresh from token...');
      this.authService.refreshPermissions();
      
      // Log again after refresh
      const refreshedPermissions = this.authService.getUserPermissions();
      console.log('Permissions after refresh:', refreshedPermissions);
    }
  }

  loadGroups() {
    this.isLoading = true;
    this.groupService.getGroups(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.groups = response.data.items;
          this.totalRecords = response.data.totalCount;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.errorMessage || 'Failed to load groups',
          });
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading groups:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load groups. Please try again.',
        });
        this.isLoading = false;
      }
    });
  }

  loadPermissions() {
    this.isPermissionsLoading = true;
    this.groupService.getPermissions(1, 50).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.allPermissions = response.data.items;
        } else {
          console.error('Failed to load permissions:', response.errorMessage);
        }
        this.isPermissionsLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading permissions:', error);
        this.isPermissionsLoading = false;
      }
    });
  }

  get totalGroups(): number {
    return this.totalRecords;
  }

  get activeGroups(): number {
    return this.groups.length; // Since API doesn't have permission count, we'll count all groups as active
  }

  get totalPermissions(): number {
    return this.allPermissions.length;
  }

  get adminGroups(): number {
    return this.groups.filter(g => g.name && g.name.toLowerCase().includes('admin')).length;
  }

  getEnabledPermissionsCount(group: GroupItem): number {
    // This would need a separate API call to get group-specific permissions
    // For now, returning 0 as placeholder
    return 0;
  }

  getTotalPermissionsCount(group: GroupItem): number {
    return this.allPermissions.length;
  }

  get filteredGroups(): GroupItem[] {
    const q = this.searchName.trim().toLowerCase();
    if (!q) return this.groups;
    return this.groups.filter((group) => 
      (group.name && group.name.toLowerCase().includes(q)) || 
      (group.description && group.description.toLowerCase().includes(q))
    );
  }

  get paginatedGroups(): GroupItem[] {
    if (!this.filteredGroups || this.filteredGroups.length === 0) {
      return [];
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredGroups.slice(startIndex, endIndex);
  }

  onPageChange(event: { page: number; pageSize: number }) {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
    this.loadGroups(); // Reload from API with new pagination
  }

  onAddNew() {
    this.selectedGroup = this.getEmptyGroup();
    this.selectedPermissions = this.getDefaultPermissions();
    this.isEditMode = false;
    this.openModal();
  }

  onEdit(group: GroupItem) {
    this.selectedGroup = { ...group };
    this.selectedPermissions = this.getDefaultPermissions();
    this.isEditMode = true;
    this.openModal();
  }

  onDelete(group: GroupItem) {
    const groupName = group.name || 'this group';
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${groupName}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.groupService.deleteGroup(group.id).subscribe({
          next: () => {
            const groupName = group.name || 'Group';
            Swal.fire({
              title: 'Deleted!',
              text: `${groupName} has been deleted successfully.`,
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            this.loadGroups(); // Reload the list
          },
          error: (error: any) => {
            console.error('Error deleting group:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete group. Please try again.',
            });
          }
        });
      }
    });
  }

  onSave() {
    if (!this.selectedGroup.name || !this.selectedGroup.description) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill in all required fields',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.isEditMode) {
      const updateRequest: GroupUpdateRequest = {
        id: this.selectedGroup.id,
        name: this.selectedGroup.name,
        description: this.selectedGroup.description
      };

      this.groupService.updateGroup(updateRequest).subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Group updated successfully!',
              timer: 2000,
              showConfirmButton: false
            });
            this.closeModal();
            this.loadGroups(); // Reload the list
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errorMessage || 'Failed to update group',
            });
          }
        },
        error: (error: any) => {
          console.error('Error updating group:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update group. Please try again.',
          });
        }
      });
    } else {
      const createRequest: GroupCreateRequest = {
        name: this.selectedGroup.name,
        description: this.selectedGroup.description
      };

      this.groupService.createGroup(createRequest).subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Group created successfully!',
              timer: 2000,
              showConfirmButton: false
            });
            this.closeModal();
            this.loadGroups(); // Reload the list
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errorMessage || 'Failed to create group',
            });
          }
        },
        error: (error: any) => {
          console.error('Error creating group:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to create group. Please try again.',
          });
        }
      });
    }
  }


  onSavePermissions() {
    // Ensure selectedPermissions is an array
    if (!this.selectedPermissions || !Array.isArray(this.selectedPermissions)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No permissions available. Please try again.',
      });
      return;
    }

    const enabledPermissionIds = this.selectedPermissions
      .filter(p => p.enabled)
      .map(p => p.id);

    const request: AssignPermissionsRequest = {
      groupId: this.selectedGroup.id,
      permissionIds: enabledPermissionIds
    };

    this.groupService.assignPermissions(request).subscribe({
      next: (response: any) => {
        // Check for success using statusCode (200 = success)
        const isSuccess = response.statusCode === 200 || 
                         (response.status === 'success' && response.statusCode === 200);
        
        if (isSuccess) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Permissions updated successfully!',
            timer: 2000,
            showConfirmButton: false
          });
          this.closePermissionModal();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.errorMessage || 'Failed to update permissions',
          });
        }
      },
      error: (error: any) => {
        console.error('Error assigning permissions:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update permissions. Please try again.',
        });
      }
    });
  }

  private getEmptyGroup(): GroupItem {
    return { 
      id: 0, 
      name: '', 
      description: '',
      version: 0,
      isNew: false,
      isDeleted: false,
      createdBy: '',
      updatedBy: '',
      createdOn: '',
      updatedOn: ''
    };
  }

  private getDefaultPermissions(): Permission[] {
    // Ensure allPermissions is an array and has items
    if (!this.allPermissions || !Array.isArray(this.allPermissions) || this.allPermissions.length === 0) {
      console.warn('No permissions available, returning empty array');
      return [];
    }
    
    return this.allPermissions.map(permission => ({
      id: permission.id,
      name: permission.name,
      description: permission.description,
      enabled: false
    }));
  }

  private openModal() {
    const modalElement = document.getElementById('groupModal');
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }

  private closeModal() {
    const modalElement = document.getElementById('groupModal');
    const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();
  }

  private openPermissionModal() {
    const modalElement = document.getElementById('permissionModal');
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }

  private closePermissionModal() {
    const modalElement = document.getElementById('permissionModal');
    const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();
  }
}
