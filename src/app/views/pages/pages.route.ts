import {Routes} from '@angular/router';
import { UserManagement } from './user-management/user-management';



export const PAGES_ROUTES: Routes = [
    {
        path: 'pages',
        children: [
            {
                path: 'user-management',
                component: UserManagement,
                data: {title: 'User Management'}
            },
        ]
    }
];
