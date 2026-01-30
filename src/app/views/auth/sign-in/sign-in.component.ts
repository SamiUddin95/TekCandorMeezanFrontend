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
    styles: [`
        .signin-btn {
            background-color: var(--primary-color);
            border-color: var(--primary-color);
            color: white;
            transition: all 0.3s ease;
        }
        .signin-btn:hover {
            background-color: var(--secondary-color);
            border-color: var(--secondary-color);
            color: black;
        }
        [data-bs-theme="dark"] .signin-btn:hover {
            color: white;
        }
        [data-bs-theme="dark"] .card-body {
            background-color: var(--bs-gray-800);
            color: var(--bs-gray-100);
        }
        [data-bs-theme="dark"] .form-control {
            background-color: var(--bs-gray-700);
            border-color: var(--bs-gray-600);
            color: var(--bs-gray-100);
        }
        [data-bs-theme="dark"] .input-group-text {
            background-color: var(--bs-gray-700);
            border-color: var(--bs-gray-600);
        }
    `],
})
export class SignInComponent {
    currentYear = currentYear
    credits = credits

    constructor(private router: Router, private authService: AuthService) {}

    signIn(email: string, password: string){
        if (!email || !password) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please enter both email and password.'
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

        this.authService.login({ email, password }).subscribe({
            next: (response) => {
                Swal.close();
                
                // AuthService automatically handles session storage
                // No need to manually store token and user
                
                Swal.fire({
                    icon: 'success',
                    title: 'Successfully logged in',
                    text: `Welcome, ${response.user.name}!`,
                    showConfirmButton: false,
                    timer: 1400
                }).then(() => this.router.navigate(['/dashboard']));
            },
            error: (error) => {
                Swal.close();
                
                const errorMessage = error.error?.message || 'Invalid email or password.';
                
                Swal.fire({
                    icon: 'error',
                    title: 'Login failed',
                    text: errorMessage
                });
            }
        });
    }
}
