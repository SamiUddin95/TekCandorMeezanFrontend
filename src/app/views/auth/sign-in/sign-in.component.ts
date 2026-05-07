import { credits, currentYear } from '@/app/constants';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import Swal from 'sweetalert2';
import { AuthService } from '@/app/services/auth.service';
import { LicenseService } from '@app/services/license.service';

@Component({
    selector: 'app-sign-in',
    host: { 'data-component-id': 'auth2-sign-in' },
    imports: [CommonModule, NgIcon],
    templateUrl: './sign-in.component.html',
    styleUrl: './sign-in.component.css'
})
export class SignInComponent implements OnInit {
    currentYear = currentYear
    credits = credits
    showUpdateLicenseBtn = false
    licenseMessage = ''

    constructor(private router: Router, private authService: AuthService, private licenseService: LicenseService) {}

    ngOnInit(): void {
        // Check license status on page load
        this.licenseService.getLicenseStatus().subscribe({
            next: (licenseResp) => {
                const status = licenseResp?.data;
                if (status) {
                    // If license is expired, redirect to update license page
                    if (status.isExpired) {
                        this.router.navigate(['/update-license']);
                        return;
                    }
                    // If license will expire within threshold days, show update button
                    if (status.daysRemaining <= this.licenseService['WARNING_THRESHOLD_DAYS']) {
                        this.showUpdateLicenseBtn = true;
                        this.licenseMessage = this.licenseService.buildWarningMessage(status);
                    }
                }
            },
            error: () => {}
        });
    }

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

                // Check license status before showing success message
                this.licenseService.getLicenseStatus().subscribe({
                    next: (licenseResp) => {
                        const status = licenseResp?.data;
                        if (status && this.licenseService.shouldShowWarning(status)) {
                            this.showUpdateLicenseBtn = true;
                            this.licenseMessage = this.licenseService.buildWarningMessage(status);
                        }

                        // AuthService automatically handles session storage

                        Swal.fire({
                            icon: 'success',
                            title: 'Successfully logged in',
                            text: `Welcome, ${response.data.name}!`,
                            showConfirmButton: false,
                            timer: 1400
                        }).then(() => this.router.navigate(['/dashboard']));
                    },
                    error: () => {
                        // If license check fails, still proceed to login
                        Swal.fire({
                            icon: 'success',
                            title: 'Successfully logged in',
                            text: `Welcome, ${response.data.name}!`,
                            showConfirmButton: false,
                            timer: 1400
                        }).then(() => this.router.navigate(['/dashboard']));
                    }
                });
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

    openUpdateLicense(): void {
        this.router.navigate(['/update-license']);
    }
}
