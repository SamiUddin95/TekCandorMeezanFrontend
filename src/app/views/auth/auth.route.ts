import { Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { UpdateLicenseComponent } from './update-license/update-license.component';

export const AUTH_ROUTES: Routes = [
      {
            path: 'sign-in',
            component: SignInComponent,
            data: { title: "Sign In" },
        },
        {
            path: 'update-license',
            component: UpdateLicenseComponent,
            data: { title: "Update License" },
        },
];
