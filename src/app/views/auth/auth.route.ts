import { Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';

export const AUTH_ROUTES: Routes = [
      {
            path: 'sign-in',
            component: SignInComponent,
            data: { title: "Sign In" },
        },
];
