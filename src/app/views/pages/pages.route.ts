import {Routes} from '@angular/router';
import { UserManagement } from './user-management/user-management';
import { Cycle } from './basic-set-up/cycle/cycle.component';
import { Branch } from './basic-set-up/branch/branch.component';
import { Hub } from './basic-set-up/hub/hub.component';
import { ReturnReason } from './basic-set-up/return-reason/return-reason.component';



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
        ]
    }
];
