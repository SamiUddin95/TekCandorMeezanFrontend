import {Routes} from '@angular/router';
import { UserManagement } from './user-management/user-management';
import { GroupComponent } from './user-management/group/group.component';
import { Cycle } from './basic-set-up/cycle/cycle.component';
import { Branch } from './basic-set-up/branch/branch.component';
import { Hub } from './basic-set-up/hub/hub.component';
import { ReturnReason } from './basic-set-up/return-reason/return-reason.component';
import { ManualImportComponent } from './ChequeProcess/manual-import/manual-import.component';
import { UploadFileComponent } from './ChequeProcess/upload-file/upload-file.component';
import { PendingChequeComponent } from './ChequeProcess/pending-cheque/pending-cheque.component';
import { ChequeDetailsComponent } from './ChequeProcess/cheque-details/cheque-details.component';
import { CallbackChequesComponent } from './ChequeProcess/callback-cheques/callback-cheques.component';
import { CallbackChequeDetailsComponent } from './ChequeProcess/callback-cheque-details/callback-cheque-details.component';



export const PAGES_ROUTES: Routes = [
    {
        path: 'pages',
        children: [
            {
                path: 'user-management',
                component: UserManagement,
                data: {title: 'User Management'}
            },
            {
                path: 'group',
                component: GroupComponent,
                data: {title: 'Group Management'}
            },
            {
                path: 'basic-set-up',
                children: [
                    {
                        path: 'cycle',
                        component: Cycle,
                        data: {title: 'Cycle'}
                    },
                    {
                        path: 'branch',
                        component: Branch,
                        data: {title: 'Branch'}
                    },
                    {
                        path: 'hub',
                        component: Hub,
                        data: {title: 'Hub'}
                    },
                    {
                        path: 'return-reason',
                        component: ReturnReason,
                        data: {title: 'Return Reason'}
                    },
                ]
            },
            {
                path: 'ChequeProcess',
                children: [
                    {
                        path: 'manual-import',
                        component: ManualImportComponent,
                        data: {title: 'Manual Cheque Import'}
                    },
                    {
                        path: 'upload-file',
                        component: UploadFileComponent,
                        data: {title: 'Upload File'}
                    },
                    {
                        path: 'pending-cheque',
                        component: PendingChequeComponent,
                        data: {title: 'Pending Cheque'}
                    },
                    {
                        path: 'cheque-details/:id',
                        component: ChequeDetailsComponent
                    },
                    {
                        path: 'callbackcheques',
                        loadComponent: () => import('./ChequeProcess/callback-cheques/callback-cheques.component').then(mod => mod.CallbackChequesComponent),
                        data: {title: 'Call Back Cheques'}
                    },
                    {
                        path: 'callback-cheque-details/:id',
                        loadComponent: () => import('./ChequeProcess/callback-cheque-details/callback-cheque-details.component').then(mod => mod.CallbackChequeDetailsComponent),
                        data: {title: 'Callback Cheque Details'}
                    },
                    {
                        path: 'return-transaction',
                        loadComponent: () => import('./ChequeProcess/return-transaction/return-transaction.component').then(mod => mod.ReturnTransactionComponent),
                        data: {title: 'Return Transaction'}
                    },
                    {
                        path: 'branch-return-confirmations',
                        loadComponent: () => import('./ChequeProcess/branch-return-confirmations/branch-return-confirmations.component').then(mod => mod.BranchReturnConfirmationsComponent),
                        data: {title: 'Branch Return Confirmations'}
                    },
                    {
                        path: 'branch-return-details/:id',
                        loadComponent: () => import('./ChequeProcess/branch-return-details/branch-return-details.component').then(mod => mod.BranchReturnDetailsComponent),
                        data: {title: 'Branch Return Details'}
                    },
                    {
                        path: 'approved-transactions',
                        loadComponent: () => import('./ChequeProcess/approved-transactions/approved-transactions.component').then(mod => mod.ApprovedTransactionsComponent),
                        data: {title: 'Approved Transactions'}
                    },
                    {
                        path: 'unauthorize-transactions',
                        loadComponent: () => import('./ChequeProcess/unauthorize-transactions/unauthorize-transactions.component').then(mod => mod.UnauthorizeTransactionsComponent),
                        data: {title: 'Un-Authorize Transactions'}
                    },
                    {
                        path: 'unauthorize-transactions-details/:id',
                        loadComponent: () => import('./ChequeProcess/unauthorize-transactions-details/unauthorize-transactions-details.component').then(mod => mod.UnauthorizeTransactionsDetailsComponent),
                        data: {title: 'Un-Authorize Transaction Details'}
                    },
                    {
                        path: 'system-rejected-cheques',
                        loadComponent: () => import('./ChequeProcess/system-rejected-cheques/system-rejected-cheques.component').then(mod => mod.SystemRejectedChequesComponent),
                        data: {title: 'System Rejected Cheques'}
                    },
                    {
                        path: 'system-rejected-cheques-details/:id',
                        loadComponent: () => import('./ChequeProcess/system-rejected-cheques-details/system-rejected-cheques-details.component').then(mod => mod.SystemRejectedChequesDetailsComponent),
                        data: {title: 'System Rejected Cheques Details'}
                    },
                    {
                        path: 'in-process-cheques',
                        loadComponent: () => import('./ChequeProcess/in-process-cheques/in-process-cheques.component').then(mod => mod.InProcessChequesComponent),
                        data: {title: 'In Process Cheques'}
                    },
                    {
                        path: 'in-process-cheques-details/:id',
                        loadComponent: () => import('./ChequeProcess/in-process-cheques-details/in-process-cheques-details.component').then(mod => mod.InProcessChequesDetailsComponent),
                        data: {title: 'In Process Cheques Details'}
                    }
                ]
            },
            {
                path: 'reports',
                children: [
                    {
                        path: 'branchwise-report',
                        loadComponent: () => import('./reports/cheque-deposit/branchwise-report/branchwise-report.component').then(mod => mod.BranchwiseReportComponent),
                        data: {title: 'Branchwise Report'}
                    },
                    {
                        path: 'cbc-report',
                        loadComponent: () => import('./reports/cheque-deposit/cbc-report/cbc-report.component').then(mod => mod.CBCReportComponent),
                        data: {title: 'CBC Report'}
                    },
                    {
                        path: 'final-report',
                        loadComponent: () => import('./reports/cheque-deposit/final-report/final-report.component').then(mod => mod.FinalReportComponent),
                        data: {title: 'Final Report'}
                    },
                    {
                        path: 'return-memo-report',
                        loadComponent: () => import('./reports/cheque-deposit/return-memo-report/return-memo-report.component').then(mod => mod.ReturnMemoReportComponent),
                        data: {title: 'Return Memo Report'}
                    },
                    {
                        path: 'return-register',
                        loadComponent: () => import('./reports/cheque-deposit/return-register/return-register.component').then(mod => mod.ReturnRegisterComponent),
                        data: {title: 'Return Register'}
                    },
                    {
                        path: 'clearing-log-report',
                        loadComponent: () => import('./reports/cheque-deposit/clearing-log-report/clearing-log-report.component').then(mod => mod.ClearingLogReportComponent),
                        data: {title: 'Clearing Log Report'}
                    },
                    {
                        path: 'inward-clearing-report',
                        loadComponent: () => import('./reports/inward-clearing-report/inward-clearing-report.component').then(mod => mod.InwardClearingReportComponent),
                        data: {title: 'Inward Clearing Report'}
                    },
                ]
            },
        ]
    }
];
