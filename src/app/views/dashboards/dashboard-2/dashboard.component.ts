import {Component, OnInit} from '@angular/core';
import {PageTitleComponent} from '@app/components/page-title.component';
import {SpinnerComponent} from '@app/components/spinner/spinner.component';
import {
    StatisticsWidgetComponent
} from '@/app/views/dashboards/dashboard-2/components/statistics-widget/statistics-widget.component';

import { DashboardService, DashboardItem } from '@app/services/dashboard.service';
import { StatisticsWidgetType } from '@/app/views/dashboards/dashboard-2/types';

@Component({
    selector: 'app-dashboard-2',
    imports: [
        PageTitleComponent,
        SpinnerComponent,
        StatisticsWidgetComponent,
    ],
    templateUrl: './dashboard.component.html'
})
export class Dashboard2Component implements OnInit {
    statistics: StatisticsWidgetType[] = [];
    isLoading: boolean = false;
    dashboardData: DashboardItem[] = [];

    constructor(private dashboardService: DashboardService) {}

    ngOnInit() {
        this.loadDashboardData();
    }

    loadDashboardData() {
        this.isLoading = true;
        this.dashboardService.getDashboardData().subscribe({
            next: (response) => {
                this.dashboardData = response.data.items;
                this.transformDataToStatistics();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading dashboard data:', error);
                this.isLoading = false;
            }
        });
    }

    transformDataToStatistics() {
        this.statistics = this.dashboardData.map(item => ({
            title: item.status,
            badge: {
                text: this.getStatusBadgeText(item.status),
                variant: this.getStatusBadgeVariant(item.status)
            },
            value: item.cheques,
            amount: item.amount,
            description: 'No. of Cheques'
        }));
    }

    getStatusBadgeText(status: string): string {
        return status;
    }

    getStatusBadgeVariant(status: string): 'success' | 'primary' | 'info' | 'warning' | 'danger' | 'secondary' {
        const variants: { [key: string]: 'success' | 'primary' | 'info' | 'warning' | 'danger' | 'secondary' } = {
            'Approved': 'success',
            'In Process': 'info',
            'Pending': 'warning',
            'Return': 'primary',
            'System Rejected': 'danger',
            'Un Authorized': 'secondary'
        };
        return variants[status] || 'secondary';
    }

    getTotalCheques(): number {
        return this.dashboardData.reduce((total, item) => total + item.cheques, 0);
    }

    getSuccessRate(): number {
        const approved = this.dashboardData.find(item => item.status === 'Approved')?.cheques || 0;
        const total = this.getTotalCheques();
        return total > 0 ? Math.round((approved / total) * 100) : 0;
    }

    getTotalAmount(): number {
        return this.dashboardData.reduce((total, item) => total + item.amount, 0);
    }
}
