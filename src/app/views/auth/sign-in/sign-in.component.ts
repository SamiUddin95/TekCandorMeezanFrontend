import { credits, currentYear } from '@/app/constants';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import Swal from 'sweetalert2';
import { AuthService } from '@/app/services/auth.service';

@Component({
    selector: 'app-sign-in',
    host: { 'data-component-id': 'auth2-sign-in' },
    imports: [RouterLink,NgIcon],
    templateUrl: './sign-in.component.html',
    styleUrl: './sign-in.component.css'
})
export class SignInComponent {
    currentYear = currentYear
    credits = credits

    constructor(private router: Router, private authService: AuthService) {}

    signIn(loginName: string, password: string){
        if (!loginName || !password) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please enter both login name and password.'
            });
            return;
        }

        Swal.fire({
            title: 'Logging in...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        this.authService.login({ loginName, password }).subscribe({
            next: (response) => {
                Swal.close();
                
                // AuthService automatically handles session storage
                
                Swal.fire({
                    icon: 'success',
                    title: 'Successfully logged in',
                    text: `Welcome, ${response.data.name}!`,
                    showConfirmButton: false,
                    timer: 1400
                }).then(() => this.router.navigate(['/dashboard']));
            },
            error: (error) => {
                Swal.close();
                
                const errorMessage = error.error?.errorMessage || 'Invalid login name or password.';
                
                Swal.fire({
                    icon: 'error',
                    title: 'Login failed',
                    text: errorMessage
                });
            }
        });
    }
}
