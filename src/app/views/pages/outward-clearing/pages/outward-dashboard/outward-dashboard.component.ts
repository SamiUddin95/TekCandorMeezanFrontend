import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EChartsOption } from 'echarts';
import { CountUpModule } from 'ngx-countup';
import { PageTitleComponent } from '@app/components/page-title.component';
import { SpinnerComponent } from '@app/components/spinner/spinner.component';
import { EchartComponent } from '@app/components/echart.component';
import { ChequeInfoItem, ChequeInfoService } from '../../services/cheque-info.service';

export interface OutwardStatusItem {
    status: string;
    code: string;
    cheques: number;
    amount: number;
}

@Component({
    selector: 'app-outward-dashboard',
    standalone: true,
    imports: [PageTitleComponent, SpinnerComponent, EchartComponent, CountUpModule],
    templateUrl: './outward-dashboard.component.html',
    styleUrl: './outward-dashboard.component.scss'
})
export class OutwardDashboardComponent implements OnInit {

    isLoading = false;

    // Two groups (mirrors Inward Dashboard's Normal vs SameDay)
    pipelineItems: OutwardStatusItem[] = [];   // Pending, Approved, Cleared
    exceptionItems: OutwardStatusItem[] = [];  // Returned, Un-Authorized, Draft

    barChartOptions!: () => EChartsOption;
    pipelinePieOptions!: () => EChartsOption;
    exceptionPieOptions!: () => EChartsOption;

    constructor(
        private router: Router,
        private chequeInfoService: ChequeInfoService
    ) {}

    ngOnInit(): void {
        this.loadDashboard();
    }

    // ── Computed KPIs ──────────────────────────────────────────────────────
    get pipelineTotal()    { return this.pipelineItems.reduce((s, i) => s + i.cheques, 0); }
    get pipelineAmount()   { return this.pipelineItems.reduce((s, i) => s + i.amount, 0); }
    get exceptionTotal()   { return this.exceptionItems.reduce((s, i) => s + i.cheques, 0); }
    get exceptionAmount()  { return this.exceptionItems.reduce((s, i) => s + i.amount, 0); }
    get grandTotal()       { return this.pipelineTotal + this.exceptionTotal; }
    get grandAmount()      { return this.pipelineAmount + this.exceptionAmount; }

    private loadDashboard(): void {
        this.isLoading = true;

        forkJoin({
            history: this.chequeInfoService.getTransactionHistory(1, 500)
        }).subscribe({
            next: (res) => {
                const items = res.history?.data?.items || [];
                this.buildStatusGroups(items);
                this.buildCharts();
                this.isLoading = false;
            },
            error: () => {
                this.buildStatusGroups([]);
                this.buildCharts();
                this.isLoading = false;
            }
        });
    }

    // ── Group cheques into Pipeline vs Exceptions ─────────────────────────
    private buildStatusGroups(items: ChequeInfoItem[]): void {
        const buckets: Record<string, OutwardStatusItem> = {
            P:  { status: 'Pending',       code: 'P',  cheques: 0, amount: 0 },
            A:  { status: 'Approved',      code: 'A',  cheques: 0, amount: 0 },
            C:  { status: 'Cleared',       code: 'C',  cheques: 0, amount: 0 },
            RE: { status: 'Returned',      code: 'RE', cheques: 0, amount: 0 },
            U:  { status: 'Un-Authorized', code: 'U',  cheques: 0, amount: 0 },
            D:  { status: 'Draft',         code: 'D',  cheques: 0, amount: 0 },
        };

        items.forEach(item => {
            const code = (item.status || '').trim().toUpperCase();
            const bucket = buckets[code] || buckets['D'];
            bucket.cheques += 1;
            bucket.amount += item.amount || 0;
        });

        this.pipelineItems  = [buckets['P'], buckets['A'], buckets['C']];
        this.exceptionItems = [buckets['RE'], buckets['U'], buckets['D']];
    }

    // ── Status colours / routes (same as Inward) ──────────────────────────
    getStatusColor(status: string): string {
        const c: Record<string, string> = {
            'Pending':       '#f59e0b',
            'Approved':      '#16a34a',
            'Cleared':       '#5a2181',
            'Returned':      '#dc2626',
            'Un-Authorized': '#6b7280',
            'Draft':         '#9ca3af'
        };
        return c[status] || '#9ca3af';
    }

    getStatusRoute(status: string): string | null {
        const normalized = status.trim().toLowerCase();
        switch (normalized) {
            case 'pending':       return '/pages/outward-clearing/operational-overview';
            case 'approved':      return '/pages/outward-clearing/transaction-history';
            case 'cleared':       return '/pages/outward-clearing/transaction-history';
            case 'returned':      return '/pages/outward-clearing/return-marking-utility';
            case 'un-authorized': return '/pages/outward-clearing/transaction-history';
            case 'draft':         return '/pages/outward-clearing/cheque-lodgment';
            default: return null;
        }
    }

    onStatusClick(status: string): void {
        const route = this.getStatusRoute(status);
        if (!route) return;
        this.router.navigate([route]);
    }

    formatAmt(val: number): string {
        if (val >= 1_000_000_000) return `Rs ${(val / 1_000_000_000).toFixed(2)}B`;
        if (val >= 1_000_000)     return `Rs ${(val / 1_000_000).toFixed(1)}M`;
        if (val >= 1_000)         return `Rs ${(val / 1_000).toFixed(0)}K`;
        return `Rs ${val}`;
    }

    // ── Chart Builders ────────────────────────────────────────────────────
    private buildCharts(): void {
        const statusColors: Record<string, string> = {
            'Pending':       '#f59e0b',
            'Approved':      '#16a34a',
            'Cleared':       '#5a2181',
            'Returned':      '#dc2626',
            'Un-Authorized': '#6b7280',
            'Draft':         '#9ca3af'
        };

        const allStatuses = [
            ...this.pipelineItems.map(i => i.status),
            ...this.exceptionItems.map(i => i.status)
        ];

        const shortLabel: Record<string, string> = {
            'Un-Authorized': 'Unauth.'
        };
        const xLabels       = allStatuses.map(s => shortLabel[s] || s);
        const pipelineMap   = new Map(this.pipelineItems.map(i => [i.status, i.cheques]));
        const exceptionMap  = new Map(this.exceptionItems.map(i => [i.status, i.cheques]));
        const pipelineData  = allStatuses.map(s => pipelineMap.get(s)  || 0);
        const exceptionData = allStatuses.map(s => exceptionMap.get(s) || 0);

        // ── Bar Chart ──────────────────────────────────────────────────────
        this.barChartOptions = () => ({
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            legend: {
                bottom: 0,
                data: ['Pipeline', 'Exceptions'],
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
                    name: 'Pipeline',
                    type: 'bar',
                    barMaxWidth: 30,
                    data: pipelineData,
                    itemStyle: { color: '#5a2181', borderRadius: [4, 4, 0, 0] },
                    label: { show: true, position: 'top', fontSize: 10, color: '#5a2181', fontWeight: 'bold' }
                },
                {
                    name: 'Exceptions',
                    type: 'bar',
                    barMaxWidth: 30,
                    data: exceptionData,
                    itemStyle: { color: '#9c59c3', borderRadius: [4, 4, 0, 0] },
                    label: { show: true, position: 'top', fontSize: 10, color: '#9c59c3', fontWeight: 'bold' }
                }
            ]
        });

        // ── Pipeline Pie ───────────────────────────────────────────────────
        this.pipelinePieOptions = () => ({
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
                data: this.pipelineItems.map(i => ({
                    name: i.status,
                    value: i.cheques,
                    itemStyle: { color: statusColors[i.status] || '#9ca3af' }
                }))
            }]
        });

        // ── Exception Pie ──────────────────────────────────────────────────
        this.exceptionPieOptions = () => ({
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
                data: this.exceptionItems.map(i => ({
                    name: i.status,
                    value: i.cheques,
                    itemStyle: { color: statusColors[i.status] || '#9ca3af' }
                }))
            }]
        });
    }
}
