import {Component, Input} from '@angular/core';
import {CountUpModule} from 'ngx-countup';
import {CurrencyPipe} from '@angular/common';

import {StatisticsWidgetType} from '@/app/views/dashboards/dashboard-2/types';

@Component({
    selector: 'app-statistics-widget',
    imports: [CountUpModule, CurrencyPipe],
    templateUrl: './statistics-widget.component.html',
    styleUrls: ['./statistics-widget.component.scss']
})
export class StatisticsWidgetComponent {
    @Input() item!: StatisticsWidgetType
}
