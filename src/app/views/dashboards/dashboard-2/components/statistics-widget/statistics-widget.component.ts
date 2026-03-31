import {Component, Input} from '@angular/core';
import {CountUpModule} from 'ngx-countup';
import {CurrencyPipe} from '@angular/common';

import {StatisticsWidgetType} from '@/app/views/dashboards/dashboard-2/types';
import {EchartComponent} from '@app/components/echart.component';

@Component({
    selector: 'app-statistics-widget',
    imports: [CountUpModule, EchartComponent, CurrencyPipe],
    templateUrl: './statistics-widget.component.html',
    styleUrls: ['./statistics-widget.component.scss']
})
export class StatisticsWidgetComponent {
    @Input() item!: StatisticsWidgetType

    // Method to get amount for each card based on the data from your image
    getAmountForCard(title: string): number {
        const amounts: { [key: string]: number } = {
            'Approved': 8849570,
            'In Process': 770365, 
            'Pending': 23038183,
            'Return': 17332317,
            'System Rejected': 3530862317,
            'Un Authorized': 15000
        };
        return amounts[title] || 0;
    }
}
