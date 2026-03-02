import { MenuItemType } from '@/app/types/layout';
import { MenuPermissionService } from '@/app/services/menu-permission.service';

type UserDropdownItemType = {
    label?: string;
    icon?: string;
    url?: string;
    isDivider?: boolean;
    isHeader?: boolean;
    class?: string;
    action?: string;
    isCollapsed?: boolean;
    children?: UserDropdownItemType[];
}

export const userDropdownItems: UserDropdownItemType[] = [];

// Static menu items with permissions - will be filtered by MenuPermissionService
export const menuItems: MenuItemType[] = [
    {
        label: 'Dashboard',
        icon: 'tablerDashboard',
        url: '/dashboard',
        requiredPermissions: ['system.Dashboard']
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
                url: '/pages/ChequeProcess/manual-import',
                requiredPermissions: ['chequeProcess.UplaodFile']
            },
            { 
                label: 'Pending Cheques', 
                icon: 'tablerClock', 
                url: '/pages/ChequeProcess/manual-import',
                requiredPermissions: ['chequeProcess.pendingCheques']
            },
            { 
                label: 'Call back Cheques', 
                icon: 'tablerPhoneCall', 
                url: '/pages/ChequeProcess/manual-import',
                requiredPermissions: ['chequeProcess.callbackcheques']
            },
            { 
                label: 'Return Transactions', 
                icon: 'tablerArrowBackUp', 
                url: '/pages/ChequeProcess/manual-import',
                requiredPermissions: ['chequeProcess.ReturnTransactions']
            },
            { 
                label: 'Branch return confirmations', 
                icon: 'tablerCheck', 
                url: '/pages/ChequeProcess/manual-import',
                requiredPermissions: ['chequeProcess.ReturnTransactions']
            },
            { 
                label: 'Approved Transactions', 
                icon: 'tablerChecklist', 
                url: '/pages/ChequeProcess/manual-import',
                requiredPermissions: ['chequeProcess.ReturnTransactions']
            },
            { 
                label: 'UnAuthorized Transactions', 
                icon: 'tablerShieldX', 
                url: '/pages/ChequeProcess/manual-import',
                requiredPermissions: ['chequeProcess.ReturnTransactions']
            },
            { 
                label: 'System Rejected Transactions', 
                icon: 'tablerXboxX', 
                url: '/pages/ChequeProcess/manual-import',
                requiredPermissions: ['chequeProcess.ReturnTransactions']
            },
            { 
                label: 'In Process Cheques ', 
                icon: 'tablerLoader', 
                url: '/pages/ChequeProcess/manual-import',
                requiredPermissions: ['chequeProcess.ReturnTransactions']
            },
        ]
    },
    {
        label: 'Reports',
        icon: 'tablerFileReport',
        isCollapsed: true,
        requiredPermissions: ['reports.view'],
        children: [
            { 
                label: 'Branchwise Report', 
                icon: 'tablerBuildingStore', 
                url: '/pages/user-management',
                requiredPermissions: ['reports.view']
            },
            { 
                label: 'CBC Report', 
                icon: 'tablerFileText', 
                url: '/pages/user-management',
                requiredPermissions: ['reports.view']
            },
            { 
                label: 'Final Report', 
                icon: 'tablerFileCheck', 
                url: '/pages/user-management',
                requiredPermissions: ['reports.view']
            },
            { 
                label: 'Inward Clearing Report', 
                icon: 'tablerArrowRight', 
                url: '/pages/user-management',
                requiredPermissions: ['reports.view']
            },
            { 
                label: 'Return Memo Report', 
                icon: 'tablerFileMinus', 
                url: '/pages/user-management',
                requiredPermissions: ['reports.view']
            },
            { 
                label: 'Return Register Report', 
                icon: 'tablerFileDatabase', 
                url: '/pages/user-management',
                requiredPermissions: ['reports.view']
            },
            { 
                label: 'Clearing Log Report', 
                icon: 'tablerClipboardList', 
                url: '/pages/user-management',
                requiredPermissions: ['reports.view']
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
];
