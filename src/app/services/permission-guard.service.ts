import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuardService {

  constructor(private authService: AuthService) { }

  // Check if user can access a specific feature
  canAccess(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  // Check if user can access any of the specified features
  canAccessAny(permissions: string[]): boolean {
    return this.authService.hasAnyPermission(permissions);
  }

  // Check if user can access all specified features
  canAccessAll(permissions: string[]): boolean {
    return this.authService.hasAllPermissions(permissions);
  }

  // Get all user permissions
  getUserPermissions(): string[] {
    return this.authService.getUserPermissions();
  }

  // Common permission checks for your application
  canManageUsers(): boolean {
    return this.canAccess('Security.Users') || this.canAccess('user.manage') || this.canAccess('admin');
  }

  canManageGroups(): boolean {
    return this.canAccess('Security.Groups') || this.canAccess('group.manage') || this.canAccess('admin');
  }

  canManageBranches(): boolean {
    return this.canAccess('branch.manage') || this.canAccess('admin');
  }

  canManageHubs(): boolean {
    return this.canAccess('hub.manage') || this.canAccess('admin');
  }

  canViewReports(): boolean {
    return this.canAccess('reports.view') || this.canAccess('admin');
  }

  canProcessCheques(): boolean {
    return this.canAccess('cheque.process') || this.canAccess('admin');
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.canAccess('admin') || this.authService.hasAnyPermission(['admin', 'superadmin', 'Security.Groups']);
  }

  // Get user-friendly permission names
  getPermissionDisplayName(permission: string): string {
    const permissionNames: { [key: string]: string } = {
      'admin': 'Administrator',
      'Security.Groups': 'Security Groups Management',
      'Security.Users': 'Security Users Management',
      'Security.Roles': 'Security Roles Management',
      'user.manage': 'User Management',
      'group.manage': 'Group Management',
      'branch.manage': 'Branch Management',
      'hub.manage': 'Hub Management',
      'reports.view': 'View Reports',
      'cheque.process': 'Cheque Processing',
      'system.dashboard': 'System Dashboard',
      'basicsetup.cycle': 'Cycle Management',
      'basicsetup.branch': 'Branch Setup',
      'basicsetup.hub': 'Hub Setup',
      'basicsetup.returnreason': 'Return Reason Setup',
      'chequeprocess.manualimport': 'Manual Import',
      'chequeprocess.uploadfile': 'Upload File',
      'chequeprocess.pendingcheques': 'Pending Cheques',
      'chequeprocess.callbackcheques': 'Callback Cheques',
      'chequeprocess.returntransactions': 'Return Transactions'
    };

    return permissionNames[permission] || permission;
  }

  // Get user-friendly list of permissions
  getUserPermissionDisplayNames(): string[] {
    const permissions = this.getUserPermissions();
    return permissions.map(permission => this.getPermissionDisplayName(permission));
  }
}
