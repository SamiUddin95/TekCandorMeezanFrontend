import { Component, OnInit } from '@angular/core';
import { PageTitleComponent } from '@app/components/page-title.component';
import { SpinnerComponent } from '@app/components/spinner/spinner.component';
import { EchartComponent } from '@app/components/echart.component';
import { CountUpModule } from 'ngx-countup';
import { DashboardService, DashboardChequeItem } from '@app/services/dashboard.service';
import { EChartsOption } from 'echarts';

@Component({
    selector: 'app-dashboard-2',
    imports: [PageTitleComponent, SpinnerComponent, EchartComponent, CountUpModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class Dashboard2Component implements OnInit {
    isLoading = false;
    normalItems: DashboardChequeItem[] = [];
    sameDayItems: DashboardChequeItem[] = [];

    barChartOptions!: () => EChartsOption;
    normalPieOptions!: () => EChartsOption;
    sameDayPieOptions!: () => EChartsOption;

    constructor(private dashboardService: DashboardService) {}

    ngOnInit() { this.loadDashboardData(); }

    // ── Computed KPIs ──────────────────────────────────────────────────────
    get normalTotal()   { return this.normalItems.reduce((s, i) => s + i.cheques, 0); }
    get normalAmount()  { return this.normalItems.reduce((s, i) => s + i.amount, 0); }
    get sameDayTotal()  { return this.sameDayItems.reduce((s, i) => s + i.cheques, 0); }
    get sameDayAmount() { return this.sameDayItems.reduce((s, i) => s + i.amount, 0); }
    get grandTotal()    { return this.normalTotal + this.sameDayTotal; }
    get grandAmount()   { return this.normalAmount + this.sameDayAmount; }

    get approvedTotal() {
        return (this.normalItems.find(i => i.status === 'Approved')?.cheques  || 0)
             + (this.sameDayItems.find(i => i.status === 'Approved')?.cheques || 0);
    }
    get approvalRate() {
        return this.grandTotal > 0 ? Math.round((this.approvedTotal / this.grandTotal) * 100) : 0;
    }
    get pendingTotal() {
        return (this.normalItems.find(i => i.status === 'Pending')?.cheques  || 0)
             + (this.sameDayItems.find(i => i.status === 'Pending')?.cheques || 0);
    }

    getStatusColor(status: string): string {
        const c: Record<string, string> = {
            'Approved': '#16a34a', 'In Process': '#0891b2', 'Pending': '#f59e0b',
            'Return': '#2563eb', 'System Rejected': '#dc2626', 'Un Authorized': '#6b7280'
        };
        return c[status] || '#9ca3af';
    }

    formatAmt(val: number): string {
        if (val >= 1_000_000_000) return `Rs ${(val / 1_000_000_000).toFixed(2)}B`;
        if (val >= 1_000_000)     return `Rs ${(val / 1_000_000).toFixed(1)}M`;
        if (val >= 1_000)         return `Rs ${(val / 1_000).toFixed(0)}K`;
        return `Rs ${val}`;
    }

    // ── Data Load ──────────────────────────────────────────────────────────
    loadDashboardData() {
        this.isLoading = true;
        this.dashboardService.getDashboardData().subscribe({
            next: (response) => {
                this.normalItems  = response.data.items.normal  || [];
                this.sameDayItems = response.data.items.sameDay || [];
                this.buildCharts();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Dashboard error:', err);
                this.isLoading = false;
            }
        });
    }

    // ── Chart Builders ─────────────────────────────────────────────────────
    private buildCharts(): void {
        const statusColors: Record<string, string> = {
            'Approved':        '#16a34a',
            'In Process':      '#0891b2',
            'Pending':         '#f59e0b',
            'Return':          '#2563eb',
            'System Rejected': '#dc2626',
            'Un Authorized':   '#6b7280'
        };

        const allStatuses = [
            ...this.normalItems.map(i => i.status),
            ...this.sameDayItems
                .map(i => i.status)
                .filter(s => !this.normalItems.find(i => i.status === s))
        ];

        const shortLabel: Record<string, string> = {
            'System Rejected': 'Sys. Rejected',
            'Un Authorized':   'Unauthorized'
        };
        const xLabels    = allStatuses.map(s => shortLabel[s] || s);
        const normalMap  = new Map(this.normalItems.map(i => [i.status, i.cheques]));
        const sameDayMap = new Map(this.sameDayItems.map(i => [i.status, i.cheques]));
        const normalData  = allStatuses.map(s => normalMap.get(s)  || 0);
        const sameDayData = allStatuses.map(s => sameDayMap.get(s) || 0);

        // ── Bar Chart ──────────────────────────────────────────────────────
        this.barChartOptions = () => ({
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            legend: {
                bottom: 0,
                data: ['Normal', 'Same Day'],
                textStyle: { fontSize: 11, color: '#374151' },
                itemWidth: 10, itemHeight: 10
            },
            grid: { left: '2%', right: '2%', bottom: '16%', top: '8%', containLabel: true },
            xAxis: {
                type: 'category',
                data: xLabels,
                axisLabel: { fontSize: 10, color: '#6b7280', interval: 0 },
                axisTick: { show: false },
                axisLine: { lineStyle: { color: '#e5e7eb' } }
            },
            yAxis: {
                type: 'value',
                axisLabel: { fontSize: 10, color: '#6b7280' },
                splitLine: { lineStyle: { color: '#f3f4f6' } }
            },
            series: [
                {
                    name: 'Normal',
                    type: 'bar',
                    barMaxWidth: 30,
                    data: normalData,
                    itemStyle: { color: '#5a2181', borderRadius: [4, 4, 0, 0] },
                    label: { show: true, position: 'top', fontSize: 10, color: '#5a2181', fontWeight: 'bold' }
                },
                {
                    name: 'Same Day',
                    type: 'bar',
                    barMaxWidth: 30,
                    data: sameDayData,
                    itemStyle: { color: '#9c59c3', borderRadius: [4, 4, 0, 0] },
                    label: { show: true, position: 'top', fontSize: 10, color: '#9c59c3', fontWeight: 'bold' }
                }
            ]
        });

        // ── Normal Pie ─────────────────────────────────────────────────────
        this.normalPieOptions = () => ({
            tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
            legend: {
                orient: 'horizontal', bottom: 0, left: 'center',
                textStyle: { fontSize: 9, color: '#6b7280' },
                itemWidth: 8, itemHeight: 8, itemGap: 5
            },
            series: [{
                type: 'pie',
                radius: ['38%', '66%'],
                center: ['50%', '43%'],
                avoidLabelOverlap: true,
                label: { show: false },
                emphasis: { label: { show: true, fontSize: 11, fontWeight: 'bold' } },
                data: this.normalItems.map(i => ({
                    name: i.status,
                    value: i.cheques,
                    itemStyle: { color: statusColors[i.status] || '#9ca3af' }
                }))
            }]
        });

        // ── SameDay Pie ────────────────────────────────────────────────────
        this.sameDayPieOptions = () => ({
            tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
            legend: {
                orient: 'horizontal', bottom: 0, left: 'center',
                textStyle: { fontSize: 9, color: '#6b7280' },
                itemWidth: 8, itemHeight: 8, itemGap: 5
            },
            series: [{
                type: 'pie',
                radius: ['38%', '66%'],
                center: ['50%', '43%'],
                avoidLabelOverlap: true,
                label: { show: false },
                emphasis: { label: { show: true, fontSize: 11, fontWeight: 'bold' } },
                data: this.sameDayItems.map(i => ({
                    name: i.status,
                    value: i.cheques,
                    itemStyle: { color: statusColors[i.status] || '#9ca3af' }
                }))
            }]
        });
    }
}
