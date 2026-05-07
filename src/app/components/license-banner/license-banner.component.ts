import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { LicenseService, LicenseStatusData } from '@app/services/license.service';

@Component({
    selector: 'app-license-banner',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './license-banner.component.html',
    styleUrl: './license-banner.component.scss'
})
export class LicenseBannerComponent implements OnInit, OnDestroy {
    status: LicenseStatusData | null = null;
    visible = false;
    dismissed = false;

    private sub?: Subscription;

    constructor(public licenseService: LicenseService) {}

    ngOnInit(): void {
        this.sub = this.licenseService.licenseStatus$.subscribe((s) => {
            this.status = s;
            this.visible = this.licenseService.shouldShowWarning(s);
        });
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }

    get message(): string {
        return this.status ? this.licenseService.buildWarningMessage(this.status) : '';
    }

    dismiss(): void {
        this.dismissed = true;
    }
}
