import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {NgIcon} from '@ng-icons/core';
import {LayoutStoreService} from '@core/services/layout-store.service';
import {LucideAngularModule, Search} from 'lucide-angular';
import {ThemeTogglerComponent} from '@layouts/components/topbar/components/theme-toggler/theme-toggler.component';
import {UserProfileComponent} from '@layouts/components/topbar/components/user-profile/user-profile.component';
import { StartBusinessDayService } from '../../../views/pages/outward-clearing/services/start-business-day.service';
import { Router } from '@angular/router';
 

@Component({
    selector: 'app-topbar',
    imports: [
        NgIcon,
        LucideAngularModule,
        ThemeTogglerComponent,
        UserProfileComponent,
        AsyncPipe,
    ],
    templateUrl: './topbar.component.html'
})
export class TopbarComponent implements OnInit {
    constructor(
        public layout: LayoutStoreService,
        private startBusinessDayService: StartBusinessDayService,
        private router: Router
    ) {
    }

    get businessDayStarted$() {
        return this.startBusinessDayService.businessDayStarted$;
    }

    ngOnInit(): void {
        this.startBusinessDayService.syncBusinessDayStatus();
    }

    toggleSidebar() {

        const html = document.documentElement;
        const currentSize = html.getAttribute('data-sidenav-size');
        const savedSize = this.layout.sidenavSize;

        if (currentSize === 'offcanvas') {
            html.classList.toggle('sidebar-enable')
            this.layout.showBackdrop()
        } else if (savedSize === 'compact') {
            this.layout.setSidenavSize(currentSize === 'compact' ? 'condensed' : 'compact', false);
        } else {
            this.layout.setSidenavSize(currentSize === 'condensed' ? 'default' : 'condensed');
        }
    }

    openStartBusinessDay(): void {
        this.router.navigate(['/pages/outward-clearing/start-business-day']);
    }

    Search = Search;
}
