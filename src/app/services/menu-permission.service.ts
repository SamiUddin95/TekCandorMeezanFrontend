import { Injectable } from '@angular/core';
import { MenuItemType } from '@/app/types/layout';
import { AuthService } from './auth.service';
import { PermissionGuardService } from './permission-guard.service';

@Injectable({
  providedIn: 'root'
})
export class MenuPermissionService {

  constructor(private authService: AuthService, private permissionGuard: PermissionGuardService) { }

  // Filter menu items based on user permissions
  getFilteredMenuItems(): MenuItemType[] {
    const userPermissions = this.authService.getUserPermissions();
    
    // If no permissions, return empty menu
    if (userPermissions.length === 0) {
      return [];
    }

    return this.filterMenuItems(this.getAllMenuItems(), userPermissions);
  }

  // Get all menu items with their required permissions
  private getAllMenuItems(): MenuItemType[] {
    return [
      {
        label: 'Inward Clearing',
        icon: 'tablerArrowBarToDown',
        isCollapsed: false,
        requiredPermissions: ['system.Dashboard', 'system.LiveMonitoring', 'basicSetUp.Cycle', 'basicSetUp.Branch', 'basicSetUp.Hub', 'basicSetUp.ReturnReason', 'chequeProcess.ManualImport', 'chequeProcess.UplaodFile', 'chequeProcess.pendingCheques', 'chequeProcess.callbackcheques', 'chequeProcess.ReturnTransactions', 'Security.Users', 'Security.Groups'],
        children: [
          {
            label: 'Dashboard',
            icon: 'tablerDashboard',
            url: '/dashboard',
            requiredPermissions: ['system.Dashboard']
          },
          {
            label: 'Live Monitoring',
            icon: 'tablerActivity',
            url: '/pages/live-monitoring',
            requiredPermissions: ['system.LiveMonitoring']
          },
          {
            label: 'Basic Setup',
            icon: 'tablerSettings',
            isCollapsed: true,
            requiredPermissions: ['basicSetUp.Cycle', 'basicSetUp.Branch', 'basicSetUp.Hub', 'basicSetUp.ReturnReason'],
            children: [
              { 
                label: 'Cycle', 
                icon: 'tablerRefresh', 
                url: '/pages/basic-set-up/cycle',
                requiredPermissions: ['basicSetUp.Cycle']
              },
              { 
                label: 'Branch', 
                icon: 'tablerBuilding', 
                url: '/pages/basic-set-up/branch',
                requiredPermissions: ['basicSetUp.Branch']
              },
              { 
                label: 'Hub', 
                icon: 'tablerNetwork', 
                url: '/pages/basic-set-up/hub',
                requiredPermissions: ['basicSetUp.Hub']
              },
              { 
                label: 'Return Reason', 
                icon: 'tablerArrowBackUp', 
                url: '/pages/basic-set-up/return-reason',
                requiredPermissions: ['basicSetUp.ReturnReason']
              },
            ]
          },
          {
            label: 'Cheque Process',
            icon: 'tablerFileDescription',
            isCollapsed: true,
            requiredPermissions: ['chequeProcess.ManualImport', 'chequeProcess.UplaodFile', 'chequeProcess.pendingCheques', 'chequeProcess.callbackcheques', 'chequeProcess.ReturnTransactions'],
            children: [
              { 
                label: 'Manual Import', 
                icon: 'tablerUpload', 
                url: '/pages/ChequeProcess/manual-import',
                requiredPermissions: ['chequeProcess.ManualImport']
              },
              { 
                label: 'Upload File', 
                icon: 'tablerFileUpload', 
                url: '/pages/ChequeProcess/upload-file',
                requiredPermissions: ['chequeProcess.UplaodFile']
              },
              { 
                label: 'Pending Cheques', 
                icon: 'tablerClock', 
                url: '/pages/ChequeProcess/pending-cheque',
                requiredPermissions: ['chequeProcess.pendingCheques']
              },
              { 
                label: 'Call back Cheques', 
                icon: 'tablerPhoneCall', 
                url: '/pages/ChequeProcess/callbackcheques',
                requiredPermissions: ['chequeProcess.callbackcheques']
              },
              { 
                label: 'Return Transactions', 
                icon: 'tablerArrowBackUp', 
                url: '/pages/ChequeProcess/return-transaction',
                requiredPermissions: ['chequeProcess.ReturnTransactions']
              },
              { 
                label: 'Branch return confirmations', 
                icon: 'tablerCheck', 
                url: '/pages/ChequeProcess/branch-return-confirmations',
                requiredPermissions: ['chequeProcess.ReturnTransactions']
              },
              { 
                label: 'Approved Transactions', 
                icon: 'tablerChecklist', 
                url: '/pages/ChequeProcess/approved-transactions',
                requiredPermissions: ['chequeProcess.ReturnTransactions']
              },
              { 
                label: 'UnAuthorized Transactions', 
                icon: 'tablerShieldX', 
                url: '/pages/ChequeProcess/unauthorize-transactions',
                requiredPermissions: ['chequeProcess.ReturnTransactions']
              },
              { 
                label: 'System Rejected Cheques', 
                icon: 'tablerXboxX', 
                url: '/pages/ChequeProcess/system-rejected-cheques',
                requiredPermissions: ['chequeProcess.ReturnTransactions']
              },
              { 
                label: 'In Process Cheques ', 
                icon: 'tablerLoader', 
                url: '/pages/ChequeProcess/in-process-cheques',
                requiredPermissions: ['chequeProcess.ReturnTransactions']
              },
            ]
          },
          {
            label: 'Security',
            icon: 'tablerShield',
            isCollapsed: true,
            requiredPermissions: ['Security.Users', 'Security.Groups'],
            children: [
              { 
                label: 'Users', 
                icon: 'tablerUsers', 
                url: '/pages/user-management',
                requiredPermissions: ['Security.Users']
              },
              { 
                label: 'Groups', 
                icon: 'tablerUsersGroup', 
                url: '/pages/group',
                requiredPermissions: ['Security.Groups']
              },
            ]
          }
        ]
      },
      {
        label: 'Outward Clearing',
        icon: 'tablerArrowBarToUp',
        isCollapsed: true,
        requiredPermissions: ['outwardClearing.StartBusinessDay', 'outwardClearing.ChequeLodgment'],
        children: [
          {
            label: 'Start Business Day',
            icon: 'tablerCalendarEvent',
            url: '/pages/outward-clearing/start-business-day',
            requiredPermissions: ['outwardClearing.StartBusinessDay']
          },
          {
            label: 'Cheque Lodgment',
            icon: 'tablerFileInvoice',
            url: '/pages/outward-clearing/cheque-lodgment',
            requiredPermissions: ['outwardClearing.ChequeLodgment']
          },
        ]
      },
      {
        label: 'Reports',
        icon: 'tablerFileReport',
        isCollapsed: true,
        requiredPermissions: ['reports.Branchwise Report','reports.CBCReport','reports.FinalReport','reports.InwardClearingReport','reports.ReturnMemoReport','reports.ReturnRegisterReport','reports.ClearingLogReport'],
        children: [
          {
            label: 'Inward Reports',
            icon: 'tablerArrowBarToDown',
            isCollapsed: true,
            requiredPermissions: ['reports.Branchwise Report','reports.CBCReport','reports.FinalReport','reports.InwardClearingReport','reports.ReturnMemoReport','reports.ReturnRegisterReport','reports.Audit.ClearingLogReport'],
            children: [
              {
                label: 'ChequeDeposit',
                icon: 'tablerFileReport',
                isCollapsed: true,
                requiredPermissions: ['reports.Branchwise Report','reports.CBCReport','reports.FinalReport','reports.InwardClearingReport','reports.ReturnMemoReport','reports.ReturnRegisterReport'],
                children: [
                   { 
                     label: 'Branchwise Report', 
                     icon: 'tablerBuildingStore', 
                     url: '/pages/reports/branchwise-report',
                     requiredPermissions: ['reports.Branchwise Report']
                   },
                   { 
                     label: 'CBC Report', 
                     icon: 'tablerFileText', 
                     url: '/pages/reports/cbc-report',
                     requiredPermissions: ['reports.CBCReport']
                   },
                   { 
                     label: 'Final Report', 
                     icon: 'tablerFileCheck', 
                     url: '/pages/reports/final-report',
                     requiredPermissions: ['reports.FinalReport']
                   },
                   { 
                     label: 'Inward Clearing Report', 
                     icon: 'tablerFileDownload', 
                     url: '/pages/reports/inward-clearing-report',
                     requiredPermissions: ['reports.InwardClearingReport']
                   },
                   { 
                     label: 'Return Memo Report', 
                     icon: 'tablerFileX', 
                     url: '/pages/reports/return-memo-report',
                     requiredPermissions: ['reports.ReturnMemoReport']
                   },
                   { 
                     label: 'Return Register', 
                     icon: 'tablerFileMinus', 
                     url: '/pages/reports/return-register',
                     requiredPermissions: ['reports.ReturnRegisterReport']
                   },
                ]
              },
              {
                label: 'Audit',
                icon: 'tablerFileClock',
                isCollapsed: true,
                requiredPermissions: ['reports.Audit.ClearingLogReport'],
                children: [
                   { 
                     label: 'Clearing Log Report', 
                     icon: 'tablerFileClock', 
                     url: '/pages/reports/clearing-log-report',
                     requiredPermissions: ['reports.Audit.ClearingLogReport']
                   },
                ]
              },
            ]
          },
          {
            label: 'Outward Reports',
            icon: 'tablerArrowBarToUp',
            isCollapsed: true,
            requiredPermissions: [],
            children: [
              // Add Outward Reports here when available
            ]
          },
        ]
      },
    ];
  }

  // Filter menu items recursively based on permissions
  private filterMenuItems(items: MenuItemType[], userPermissions: string[]): MenuItemType[] {
    return items.filter(item => {
      // Check if user has permission for this item
      if (item.requiredPermissions && item.requiredPermissions.length > 0) {
        const hasPermission = item.requiredPermissions.some((permission: string) => 
          userPermissions.includes(permission)
        );
        
        if (!hasPermission) {
          return false; // Hide this menu item
        }
      }

      // If item has children, filter them too
      if (item.children && item.children.length > 0) {
        item.children = this.filterMenuItems(item.children, userPermissions);
        
        // Hide parent if no children are visible
        if (item.children.length === 0) {
          return false;
        }
      }

      return true; // Show this menu item
    });
  }

  // Check if user can access specific menu item
  canAccessMenuItem(item: MenuItemType): boolean {
    const userPermissions = this.authService.getUserPermissions();
    
    if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
      return true; // No permissions required
    }

    return item.requiredPermissions.some((permission: string) => 
      userPermissions.includes(permission)
    );
  }

  // Get menu items count for user
  getMenuItemsCount(): number {
    return this.getFilteredMenuItems().length;
  }

  // Check if user has any menu access
  hasMenuAccess(): boolean {
    return this.getMenuItemsCount() > 0;
  }
}
