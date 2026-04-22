import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SpinnerComponent } from '@app/components/spinner/spinner.component';
import Swal from 'sweetalert2';
import { GroupService, GroupItem, GroupCreateRequest, GroupUpdateRequest, PermissionItem } from '../../../../services/group.service';
import { Userservice } from '../../../../services/user.service';
import { Subscription } from 'rxjs';

export interface GroupUser {
  id: number;
  name: string;
  email: string;
}

export interface GroupPermission {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  recordValue?: string;
}

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './group-detail.component.html',
  styleUrl: './group-detail.component.scss'
})
export class GroupDetailComponent implements OnInit, OnDestroy {
  activeTab: 'info' | 'users' | 'permissions' = 'info';
  isNew = true;
  groupId: number = 0;
  isLoading = false;
  isSaving = false;

  // Info Tab
  groupName = '';
  groupDescription = '';
  groupUpperLimit: number | null = null;

  // Users Tab
  groupUsers: GroupUser[] = [];
  isUsersLoading = false;
  showSelectUsersModal = false;
  allUsers: GroupUser[] = [];
  isAllUsersLoading = false;
  userSearchName = '';
  selectedUserIds: Set<number> = new Set();

  // Permissions Tab
  allPermissions: GroupPermission[] = [];
  filteredPermissions: GroupPermission[] = [];
  isPermissionsLoading = false;
  moduleNameFilter = '';
  originalPermissions: GroupPermission[] = [];

  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private groupService: GroupService,
    private userService: Userservice
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.groupId = parseInt(id, 10);
      this.isNew = false;
      this.loadGroupDetails();
    } else {
      // For new groups, load all permissions
      this.loadPermissions();
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  setActiveTab(tab: 'info' | 'users' | 'permissions') {
    this.activeTab = tab;
  }

  loadGroupDetails() {
    this.isLoading = true;
    this.subscriptions.add(
      this.groupService.getGroupById(this.groupId).subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            const group = response.data;
            // Load Info tab data
            this.groupName = group.name || '';
            this.groupDescription = group.description || '';
            this.groupUpperLimit = group.upperLimit ?? group.upperlimit ?? null;
            
            // Load Users tab data
            this.groupUsers = (group.users || []).map((u: any) => ({
              id: u.id,
              name: u.name || u.loginName || '',
              email: u.email || ''
            }));
            
            // Load Permissions tab data
            this.loadPermissions(group.permissions);
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load group details.' });
        }
      })
    );
  }

  loadGroupUsers() {
    this.isUsersLoading = true;
    this.subscriptions.add(
      this.groupService.getGroupUsers(this.groupId).subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            this.groupUsers = (response.data?.items || response.data || []).map((u: any) => ({
              id: u.id,
              name: u.name || u.loginName || '',
              email: u.email || ''
            }));
          }
          this.isUsersLoading = false;
        },
        error: () => {
          this.isUsersLoading = false;
        }
      })
    );
  }

  loadPermissions(groupPermissions?: any[]) {
    this.isPermissionsLoading = true;
    
    // Always load all available permissions from the Permission API
    this.subscriptions.add(
      this.groupService.getPermissions(1, 1000).subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            // Get all available permissions
            const allAvailablePermissions = response.data?.items || [];
            
            // Get enabled permission IDs from group permissions (if provided)
            const enabledPermissionIds = new Set<number>();
            if (groupPermissions && groupPermissions.length > 0) {
              groupPermissions.forEach((p: any) => {
                enabledPermissionIds.add(p.id);
              });
            }
            
            // Map all permissions with enabled status
            this.allPermissions = allAvailablePermissions.map((p: PermissionItem) => ({
              id: p.id,
              name: p.name,
              description: p.description || '',
              recordValue: p.name,
              enabled: enabledPermissionIds.has(p.id) // Only group permissions are enabled
            }));
            
            this.filteredPermissions = [...this.allPermissions];
            this.originalPermissions = this.allPermissions.map(p => ({ ...p }));
          }
          this.isPermissionsLoading = false;
        },
        error: () => { 
          this.isPermissionsLoading = false;
          Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load permissions.' });
        }
      })
    );
  }


  filterPermissions() {
    const q = this.moduleNameFilter.trim().toLowerCase();
    this.filteredPermissions = q
      ? this.allPermissions.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      : [...this.allPermissions];
  }

  savePermissions() {
    const enabledIds = this.allPermissions.filter(p => p.enabled).map(p => p.id);
    this.isSaving = true;
    this.subscriptions.add(
      this.groupService.assignPermissions({ groupId: this.groupId, permissionIds: enabledIds }).subscribe({
        next: (response: any) => {
          this.isSaving = false;
          // Handle the actual response format
          if (response === "Permissions assigned successfully." || response.status === 'success' || response.statusCode === 200) {
            this.originalPermissions = this.allPermissions.map(p => ({ ...p }));
            Swal.fire({ 
              icon: 'success', 
              title: 'Saved', 
              text: 'Permissions assigned successfully.', 
              timer: 2000, 
              showConfirmButton: false 
            });
          } else {
            Swal.fire({ 
              icon: 'error', 
              title: 'Error', 
              text: response.errorMessage || response.message || 'Failed to save permissions.' 
            });
          }
        },
        error: () => {
          this.isSaving = false;
          Swal.fire({ 
            icon: 'error', 
            title: 'Error', 
            text: 'Failed to save permissions.' 
          });
        }
      })
    );
  }

  cancelPermissions() {
    this.allPermissions = this.originalPermissions.map(p => ({ ...p }));
    this.filteredPermissions = [...this.allPermissions];
  }

  // Users Modal
  openSelectUsersModal() {
    this.selectedUserIds = new Set();
    this.userSearchName = '';
    this.showSelectUsersModal = true;
    this.loadAllUsers();
  }

  closeSelectUsersModal() {
    this.showSelectUsersModal = false;
  }

  loadAllUsers() {
    this.isAllUsersLoading = true;
    this.subscriptions.add(
      this.userService.getAllUsers(1, 1000).subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            this.allUsers = (response.data?.items || []).map((u: any) => ({
              id: u.id,
              name: u.name || u.loginName || '',
              email: u.email || ''
            }));
          }
          this.isAllUsersLoading = false;
        },
        error: () => { this.isAllUsersLoading = false; }
      })
    );
  }

  searchUsers() {
    this.loadAllUsers();
  }

  get filteredAllUsers(): GroupUser[] {
    const q = this.userSearchName.trim().toLowerCase();
    const existingIds = new Set(this.groupUsers.map(u => u.id));
    const available = this.allUsers.filter(u => !existingIds.has(u.id));
    return q ? available.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) : available;
  }

  toggleUserSelection(userId: number) {
    if (this.selectedUserIds.has(userId)) {
      this.selectedUserIds.delete(userId);
    } else {
      this.selectedUserIds.add(userId);
    }
  }

  toggleAllUsers(event: any) {
    if (event.target.checked) {
      this.filteredAllUsers.forEach(u => this.selectedUserIds.add(u.id));
    } else {
      this.selectedUserIds.clear();
    }
  }

  confirmAddUsers() {
    if (this.selectedUserIds.size === 0) return;
    
    this.isAllUsersLoading = true;
    const request = {
      securityGroupId: this.groupId,
      selectedIds: Array.from(this.selectedUserIds)
    };
    
    this.subscriptions.add(
      this.groupService.addUsers(request).subscribe({
        next: (response: any) => {
          this.isAllUsersLoading = false;
          if (response.status === 'success' || response.statusCode === 200) {
            // Add selected users to the local array
            const toAdd = this.allUsers.filter(u => this.selectedUserIds.has(u.id));
            toAdd.forEach(u => {
              if (!this.groupUsers.find(gu => gu.id === u.id)) {
                this.groupUsers.push({ ...u });
              }
            });
            this.closeSelectUsersModal();
            Swal.fire({ 
              icon: 'success', 
              title: 'Success', 
              text: 'Users added successfully', 
              timer: 2000, 
              showConfirmButton: false 
            });
          } else {
            Swal.fire({ 
              icon: 'error', 
              title: 'Error', 
              text: response.errorMessage || 'Failed to add users.' 
            });
          }
        },
        error: () => {
          this.isAllUsersLoading = false;
          Swal.fire({ 
            icon: 'error', 
            title: 'Error', 
            text: 'Failed to add users.' 
          });
        }
      })
    );
  }

  removeUser(user: GroupUser) {
    this.groupUsers = this.groupUsers.filter(u => u.id !== user.id);
  }

  // Save Group (Info tab)
  saveGroup() {
    if (!this.groupName.trim() || !this.groupDescription.trim()) {
      Swal.fire({ icon: 'warning', title: 'Validation', text: 'Please fill in Security Group name and Description.' });
      return;
    }
    this.isSaving = true;
    if (this.isNew) {
      const req: GroupCreateRequest = {
        name: this.groupName,
        description: this.groupDescription,
        upperLimit: this.groupUpperLimit ?? null
      };
      this.subscriptions.add(
        this.groupService.createGroup(req).subscribe({
          next: (response: any) => {
            this.isSaving = false;
            if (response.status === 'success') {
              this.groupId = response.data?.id || response.data;
              this.isNew = false;
              Swal.fire({ icon: 'success', title: 'Created', text: 'Security group created successfully.', timer: 2000, showConfirmButton: false });
            } else {
              Swal.fire({ icon: 'error', title: 'Error', text: response.errorMessage || 'Failed to create group.' });
            }
          },
          error: () => {
            this.isSaving = false;
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to create group.' });
          }
        })
      );
    } else {
      const req: GroupUpdateRequest = {
        id: this.groupId,
        name: this.groupName,
        description: this.groupDescription,
        upperLimit: this.groupUpperLimit ?? null
      };
      this.subscriptions.add(
        this.groupService.updateGroup(req).subscribe({
          next: (response: any) => {
            this.isSaving = false;
            if (response.status === 'success') {
              Swal.fire({ icon: 'success', title: 'Updated', text: 'Security group updated successfully.', timer: 2000, showConfirmButton: false });
            } else {
              Swal.fire({ icon: 'error', title: 'Error', text: response.errorMessage || 'Failed to update group.' });
            }
          },
          error: () => {
            this.isSaving = false;
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update group.' });
          }
        })
      );
    }
  }

  goBack() {
    this.router.navigate(['/pages/group']);
  }
}
