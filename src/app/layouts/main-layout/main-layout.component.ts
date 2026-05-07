import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {LayoutStoreService} from '@core/services/layout-store.service';
import {VerticalLayoutComponent} from '../vertical-layout/vertical-layout.component';
import {LicenseService} from '@app/services/license.service';

@Component({
    selector: 'app-main-layout',
    imports: [
        RouterOutlet,
        VerticalLayoutComponent,
    ],
    templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent implements OnInit {
    constructor(public layout: LayoutStoreService, private licenseService: LicenseService) {
    }

    ngOnInit(): void {
        // Refresh license status when entering authenticated area (covers page reloads)
        if (!this.licenseService.getCurrentStatus()) {
            this.licenseService.getLicenseStatus().subscribe({ error: () => {} });
        }
    }
}
