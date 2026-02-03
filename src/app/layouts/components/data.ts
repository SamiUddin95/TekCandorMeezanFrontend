import { MenuItemType } from '@/app/types/layout';

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

export const menuItems: MenuItemType[] = [
    {
            label: 'Dashboard',
            icon: 'tablerDashboard',
             url: '/dashboard',
    },
    {
        label: 'Basic Setup',
        icon: 'tablerSettings',
        isCollapsed: true,
        children: [
            { label: 'Cycle', icon: 'tablerRefresh', url: '/pages/basic-set-up/cycle' },
            { label: 'Branch', icon: 'tablerBuilding', url: '/pages/basic-set-up/branch' },
            { label: 'Hub', icon: 'tablerNetwork', url: '/pages/basic-set-up/hub' },
            { label: 'Return Reason', icon: 'tablerArrowBackUp', url: '/pages/basic-set-up/return-reason' },
        ]
    },

    {
        label: 'Cheque Process',
        icon: 'tablerFileDescription',
        isCollapsed: true,
        children: [
            { label: 'Manual Import', icon: 'tablerUpload', url: '/pages/interest-industries-and-more' },
            { label: 'Upload File', icon: 'tablerFileUpload', url: '/pages/app-management' },
            { label: 'Pending Cheques', icon: 'tablerClock', url: '/pages/app-management' },
            { label: 'Call back Cheques', icon: 'tablerPhoneCall', url: '/pages/app-management' },
            { label: 'Return Transactions', icon: 'tablerArrowBackUp', url: '/pages/app-management' },
            { label: 'Branch return confirmations', icon: 'tablerCheck', url: '/pages/app-management' },
            { label: 'Approved Transactions', icon: 'tablerChecklist', url: '/pages/app-management' },
            { label: 'UnAuthorized Transactions', icon: 'tablerShieldX', url: '/pages/app-management' },
            { label: 'System Rejected Transactions', icon: 'tablerXboxX', url: '/pages/app-management' },
            { label: 'In Process Cheques ', icon: 'tablerLoader', url: '/pages/app-management' },
        ]
    },

    {
        label: 'Reports',
        icon: 'tablerFileReport',
        isCollapsed: true,
        children: [
            { label: 'Branchwise Report', icon: 'tablerBuildingStore', url: '/pages/analytics' },
            { label: 'CBC Report', icon: 'tablerFileText', url: '/pages/app-management' },
            { label: 'Final Report', icon: 'tablerFileCheck', url: '/pages/app-management' },
            { label: 'Inward Clearing Report', icon: 'tablerArrowRight', url: '/pages/app-management' },
            { label: 'Return Memo Report', icon: 'tablerFileMinus', url: '/pages/app-management' },
            { label: 'Return Register Report', icon: 'tablerFileDatabase', url: '/pages/app-management' },
            { label: 'Clearing Log Report', icon: 'tablerClipboardList', url: '/pages/app-management' },
        ]
    },
    {
        label: 'Security',
        icon: 'tablerShield',
        isCollapsed: true,
        children: [
            { label: 'Users', icon: 'tablerUsers', url: '/pages/user-management' },
            { label: 'Groups', icon: 'tablerUsersGroup', url: '/pages/groups' },
        ]
    }

];
