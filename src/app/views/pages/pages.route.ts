import {Routes} from '@angular/router';
import { UserManagement } from './user-management/user-management';
import { GroupComponent } from './user-management/group/group.component';
import { Cycle } from './basic-set-up/cycle/cycle.component';
import { Branch } from './basic-set-up/branch/branch.component';
import { Hub } from './basic-set-up/hub/hub.component';
import { ReturnReason } from './basic-set-up/return-reason/return-reason.component';
import { ManualImportComponent } from './ChequeProcess/manual-import/manual-import.component';



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
                    }
                ]
            },
        ]
    }
];
