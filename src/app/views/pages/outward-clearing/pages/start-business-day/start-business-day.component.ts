import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { PageTitleComponent } from '@app/components/page-title.component';
import { AuthService } from '../../../../../services/auth.service';
import { BusinessDateRequest, StartBusinessDayService } from '../../services/start-business-day.service';

@Component({
    selector: 'app-start-business-day',
    imports: [CommonModule, PageTitleComponent],
    templateUrl: './start-business-day.component.html',
    styleUrl: './start-business-day.component.scss'
})
export class StartBusinessDayComponent implements OnInit {

    isStarting = false;
    businessDate: Date = new Date();
    isDayStarted = false;
    businessDateId = 0;

    systemChecks = [
        { label: 'Network Connectivity', ok: true },
        { label: 'MICR Scanner Online', ok: true },
        { label: 'Branch Vault Sync', ok: true },
    ];

    constructor(
        private startBusinessDayService: StartBusinessDayService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadBusinessDate();
    }

    loadBusinessDate(): void {
        this.startBusinessDayService.getBusinessDate().subscribe({
            next: (response) => {
                const latest = response?.data?.items?.[0];
                if (!latest) {
                    this.businessDate = new Date();
                    this.isDayStarted = false;
                    this.businessDateId = 0;
                    this.startBusinessDayService.setBusinessDayStatus(false);
                    return;
                }

                this.businessDateId = latest.id || 0;
                this.businessDate = latest.businessDate ? new Date(latest.businessDate) : new Date();
                this.isDayStarted = !!latest.isActive;
                this.startBusinessDayService.setBusinessDayStatus(this.isDayStarted);
            },
            error: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Load Failed',
                    text: 'Unable to load current business day status.',
                    confirmButtonColor: '#5a2181'
                });
            }
        });
    }

    onStartBusinessDay(): void {
        Swal.fire({
            title: 'Start Business Day?',
            text: 'This will timestamp your login, synchronize the branch ledger and enable Cheque Lodgment modules for all tellers.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#5a2181',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Start Day',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                this.isStarting = true;

                const currentUser = this.authService.getCurrentUser();
                const startedBy = currentUser?.name || currentUser?.loginName || 'System User';

                const payload: BusinessDateRequest = {
                    id: this.businessDateId,
                    businessDate: this.businessDate ? this.businessDate.toISOString() : new Date().toISOString(),
                    isActive: true,
                    startedBy,
                    startedAt: new Date().toISOString()
                };

                this.startBusinessDayService.startBusinessDate(payload).subscribe({
                    next: (response) => {
                        this.isStarting = false;
                        this.isDayStarted = true;
                        this.startBusinessDayService.setBusinessDayStatus(true);

                        if (response?.data) {
                            this.businessDateId = response.data.id || this.businessDateId;
                            this.businessDate = response.data.businessDate ? new Date(response.data.businessDate) : this.businessDate;
                        }

                        Swal.fire({
                            icon: 'success',
                            title: 'Business Day Started',
                            text: 'The business day has been successfully initiated.',
                            confirmButtonColor: '#5a2181',
                            timer: 2500,
                            timerProgressBar: true
                        });
                    },
                    error: () => {
                        this.isStarting = false;
                        Swal.fire({
                            icon: 'error',
                            title: 'Start Failed',
                            text: 'Unable to start business day. Please try again.',
                            confirmButtonColor: '#5a2181'
                        });
                    }
                });
            }
        });
    }
}
