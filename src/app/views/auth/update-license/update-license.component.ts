import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LicenseService } from '@app/services/license.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-update-license',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './update-license.component.html',
    styleUrl: './update-license.component.scss'
})
export class UpdateLicenseComponent {
    encryptedKey = '';
    isSubmitting = false;

    constructor(
        private router: Router,
        private licenseService: LicenseService
    ) {}

    onSubmit(): void {
        if (!this.encryptedKey.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing License Key',
                text: 'Please paste the license key received via email.'
            });
            return;
        }

        this.isSubmitting = true;

        this.licenseService.updateLicense(this.encryptedKey.trim()).subscribe({
            next: (response) => {
                this.isSubmitting = false;
                if (response.status === 'success' || response.statusCode === 200) {
                    Swal.fire({
                        icon: 'success',
                        title: 'License Updated',
                        text: 'Your license has been successfully updated.',
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                        this.encryptedKey = '';
                        this.router.navigate(['/sign-in']);
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Update Failed',
                        text: response?.errorMessage || 'Unable to update license. Please check the key and try again.'
                    });
                }
            },
            error: (error) => {
                this.isSubmitting = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: error?.error?.errorMessage || 'Unable to update license. Please check the key and try again.'
                });
            }
        });
    }

    onCancel(): void {
        this.encryptedKey = '';
        this.router.navigate(['/sign-in']);
    }
}
