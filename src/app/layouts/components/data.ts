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
        label: 'Inward Clearing',
        icon: 'tablerArrowBarToDown',
        isCollapsed: true,
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
                        url: '/pages/ChequeProcess/branch-return-confirmations',
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
        requiredPermissions: ['outwardClearing.StartBusinessDay', 'outwardClearing.ChequeLodgment', 'outwardClearing.GenerateClearingFile', 'outwardClearing.OperationalOverview'],
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
            {
                label: 'Generate Lodgment File',
                icon: 'tablerFileExport',
                url: '/pages/outward-clearing/generate-clearing-file',
                requiredPermissions: ['outwardClearing.GenerateClearingFile']
            },
            {
                label: 'Operational Overview',
                icon: 'tablerEye',
                url: '/pages/outward-clearing/operational-overview',
                requiredPermissions: ['outwardClearing.OperationalOverview']
            },
            {
                label: 'NIFT Reconciliation',
                icon: 'tablerFileSymlink',
                url: '/pages/outward-clearing/nift-reconciliation',
                requiredPermissions: ['outwardClearing.NiftReconciliation']
            },
            {
                label: 'Fund Realization',
                icon: 'tablerCoin',
                url: '/pages/outward-clearing/fund-realization',
                requiredPermissions: ['outwardClearing.FundRealization']
            },
            {
                label: 'Return Marking Utility',
                icon: 'tablerArrowBackUp',
                url: '/pages/outward-clearing/return-marking-utility',
                requiredPermissions: ['outwardClearing.ReturnMarkingUtility']
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
                                url: '/pages/reports/cheque-deposit/branchwise-report',
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
    }
];
