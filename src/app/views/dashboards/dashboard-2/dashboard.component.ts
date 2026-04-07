import {Component} from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {PageTitleComponent} from '@app/components/page-title.component';
import {statistics} from '@/app/views/dashboards/dashboard-2/data';
import {
    StatisticsWidgetComponent
} from '@/app/views/dashboards/dashboard-2/components/statistics-widget/statistics-widget.component';
import {
    StatisticsBarChartComponent
} from '@/app/views/dashboards/dashboard-2/components/statistics-bar-chart/statistics-bar-chart.component';

@Component({
    selector: 'app-dashboard-2',
    imports: [
        PageTitleComponent,
        StatisticsWidgetComponent,
        StatisticsBarChartComponent,
        CurrencyPipe,
    ],
    templateUrl: './dashboard.component.html'
})
export class Dashboard2Component {
    statistics = statistics;

    getTotalCheques(): number {
        return this.statistics.reduce((total, stat) => total + stat.value, 0);
    }

    getSuccessRate(): number {
        const approved = this.statistics.find(s => s.title === 'Approved')?.value || 0;
        const total = this.getTotalCheques();
        return total > 0 ? Math.round((approved / total) * 100) : 0;
    }

    getTotalAmount(): number {
        const amounts: { [key: string]: number } = {
            'Approved': 8849570,
            'In Process': 770365, 
            'Pending': 23038183,
            'Return': 17332317,
            'System Rejected': 3530862317,
            'Un Authorized': 15000
        };
        
        return this.statistics.reduce((total, stat) => {
            return total + (amounts[stat.title] || 0);
        }, 0);
    }
}
