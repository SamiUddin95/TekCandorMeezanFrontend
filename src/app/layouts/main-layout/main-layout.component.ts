import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {LayoutStoreService} from '@core/services/layout-store.service';
import {VerticalLayoutComponent} from '../vertical-layout/vertical-layout.component';

@Component({
    selector: 'app-main-layout',
    imports: [
        RouterOutlet,
        VerticalLayoutComponent,
    ],
    templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
    constructor(public layout: LayoutStoreService) {
    }
}
