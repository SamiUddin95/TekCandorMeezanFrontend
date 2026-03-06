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
                    }
                ]
            },
        ]
    }
];
