import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { PageTitleComponent } from '@app/components/page-title.component';

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

    systemChecks = [
        { label: 'Network Connectivity', ok: true },
        { label: 'MICR Scanner Online', ok: true },
        { label: 'Branch Vault Sync', ok: true },
    ];

    ngOnInit(): void {
        // Static for now — will integrate API once backend is ready
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
                setTimeout(() => {
                    this.isStarting = false;
                    this.isDayStarted = true;
                    Swal.fire({
                        icon: 'success',
                        title: 'Business Day Started',
                        text: 'The business day has been successfully initiated.',
                        confirmButtonColor: '#5a2181',
                        timer: 2500,
                        timerProgressBar: true
                    });
                }, 1200);
            }
        });
    }
}
