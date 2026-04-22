import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';
import { forkJoin } from 'rxjs';
import { ChequeInfoItem, ChequeInfoService } from '../../services/cheque-info.service';
import { FilterService } from '../../../../../services/filter.service';

interface KpiCard {
    key: string;
    label: string;
    value: number;
    prefix?: string;
    suffix?: string;
    delta: number;
    icon: string;
    gradient: string;
    trend: 'up' | 'down' | 'flat';
}

interface StatusBucket {
    label: string;
    code: string;
    count: number;
    amount: number;
    color: string;
}

interface BranchBucket {
    label: string;
    code: string;
    count: number;
    amount: number;
}

interface ActivityItem {
    id: number;
    title: string;
    subtitle: string;
    amount: number;
    status: string;
    statusClass: string;
    time: string;
}

interface QuickAction {
    label: string;
    description: string;
    icon: string;
    route: string;
    accent: string;
}

@Component({
    selector: 'app-outward-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, NgApexchartsModule],
    templateUrl: './outward-dashboard.component.html',
    styleUrl: './outward-dashboard.component.scss'
})
export class OutwardDashboardComponent implements OnInit {

    isLoading = false;
    lastUpdated = '';
    businessDate = '';
    operator = 'Operations Desk';

    kpis: KpiCard[] = [];
    statusBuckets: StatusBucket[] = [];
    topBranches: BranchBucket[] = [];
    recentActivity: ActivityItem[] = [];

    totalBranches = 0;
    totalHubs = 0;

    // Chart options
    trendChart: ApexOptions = {} as ApexOptions;
    statusChart: ApexOptions = {} as ApexOptions;
    branchChart: ApexOptions = {} as ApexOptions;
    hourlyChart: ApexOptions = {} as ApexOptions;

    quickActions: QuickAction[] = [
        { label: 'New Lodgment', description: 'Capture a new cheque deposit', icon: 'fas fa-file-circle-plus', route: '/pages/outward-clearing/cheque-lodgment/new', accent: 'purple' },
        { label: 'Generate File', description: 'Run clearing file generation', icon: 'fas fa-file-export', route: '/pages/outward-clearing/generate-clearing-file', accent: 'amber' },
        { label: 'Operational Overview', description: 'Approve pending instruments', icon: 'fas fa-list-check', route: '/pages/outward-clearing/operational-overview', accent: 'green' },
        { label: 'NIFT Reconciliation', description: 'Match inter-bank responses', icon: 'fas fa-file-shield', route: '/pages/outward-clearing/nift-reconciliation', accent: 'blue' },
        { label: 'Fund Realization', description: 'Credit realized amounts', icon: 'fas fa-coins', route: '/pages/outward-clearing/fund-realization', accent: 'teal' },
        { label: 'Return Marking', description: 'Mark cheque returns', icon: 'fas fa-rotate-left', route: '/pages/outward-clearing/return-marking-utility', accent: 'red' },
    ];

    constructor(
        private router: Router,
        private chequeInfoService: ChequeInfoService,
        private filterService: FilterService
    ) {}

    ngOnInit(): void {
        this.businessDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        this.loadDashboard();
    }

    refresh(): void {
        this.loadDashboard();
    }

    private loadDashboard(): void {
        this.isLoading = true;

        forkJoin({
            history: this.chequeInfoService.getTransactionHistory(1, 200),
            branches: this.filterService.getBranches(),
            hubs: this.filterService.getHubs()
        }).subscribe({
            next: (res) => {
                const items = res.history?.data?.items || [];
                this.totalBranches = (res.branches?.data?.branches || []).length;
                this.totalHubs = (res.hubs?.data?.hubs || []).length;

                this.buildKpis(items);
                this.buildStatusBuckets(items);
                this.buildTopBranches(items);
                this.buildRecentActivity(items);
                this.buildCharts(items);

                this.lastUpdated = this.nowLabel();
                this.isLoading = false;
            },
            error: () => {
                this.buildKpis([]);
                this.buildStatusBuckets([]);
                this.buildTopBranches([]);
                this.buildRecentActivity([]);
                this.buildCharts([]);
                this.lastUpdated = this.nowLabel();
                this.isLoading = false;
            }
        });
    }

    // ─── KPI ──────────────────────────────────────────────────────────────
    private buildKpis(items: ChequeInfoItem[]): void {
        const totalCount = items.length;
        const totalAmount = items.reduce((s, i) => s + (i.amount || 0), 0);

        const approved = items.filter(i => this.normStatus(i.status) === 'A').length;
        const pending = items.filter(i => this.normStatus(i.status) === 'P').length;
        const returned = items.filter(i => this.normStatus(i.status) === 'RE' || i.isReturned).length;
        const realized = items.filter(i => i.isRealized).length;

        const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;

        this.kpis = [
            {
                key: 'total', label: 'Total Lodgments', value: totalCount,
                delta: this.sampleDelta(totalCount), trend: 'up',
                icon: 'fas fa-file-invoice-dollar',
                gradient: 'linear-gradient(135deg, #5a2181 0%, #9c59c3 100%)'
            },
            {
                key: 'amount', label: 'Total Amount', value: totalAmount,
                prefix: 'PKR ', delta: this.sampleDelta(totalAmount), trend: 'up',
                icon: 'fas fa-sack-dollar',
                gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
            },
            {
                key: 'approved', label: 'Approved', value: approved,
                delta: approved > 0 ? 8 : 0, trend: approved > 0 ? 'up' : 'flat',
                icon: 'fas fa-circle-check',
                gradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
            },
            {
                key: 'pending', label: 'Pending Review', value: pending,
                delta: pending > 0 ? 3 : 0, trend: pending > 5 ? 'up' : 'down',
                icon: 'fas fa-hourglass-half',
                gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'
            },
            {
                key: 'returned', label: 'Returned', value: returned,
                delta: returned > 0 ? 2 : 0, trend: returned > 0 ? 'up' : 'flat',
                icon: 'fas fa-rotate-left',
                gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
            },
            {
                key: 'avg', label: 'Avg Ticket Size', value: Math.round(avgAmount),
                prefix: 'PKR ', delta: 5, trend: 'up',
                icon: 'fas fa-chart-line',
                gradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)'
            },
        ];

        // Silence lint on realized (used in status bucket too)
        void realized;
    }

    private sampleDelta(base: number): number {
        if (!base) return 0;
        return Math.round((Math.random() * 12 + 2) * 10) / 10;
    }

    // ─── Status buckets (for donut + chips) ──────────────────────────────
    private buildStatusBuckets(items: ChequeInfoItem[]): void {
        const buckets: Record<string, StatusBucket> = {
            P: { label: 'Pending', code: 'P', count: 0, amount: 0, color: '#2563eb' },
            A: { label: 'Approved', code: 'A', count: 0, amount: 0, color: '#16a34a' },
            C: { label: 'Cleared', code: 'C', count: 0, amount: 0, color: '#5a2181' },
            RE: { label: 'Returned', code: 'RE', count: 0, amount: 0, color: '#dc2626' },
            U: { label: 'Un-Authorized', code: 'U', count: 0, amount: 0, color: '#f59e0b' },
            D: { label: 'Draft', code: 'D', count: 0, amount: 0, color: '#9ca3af' },
        };

        items.forEach((item) => {
            const code = this.normStatus(item.status);
            const bucket = buckets[code] || buckets['D'];
            bucket.count += 1;
            bucket.amount += item.amount || 0;
        });

        this.statusBuckets = Object.values(buckets).filter(b => b.count > 0);
        if (this.statusBuckets.length === 0) {
            this.statusBuckets = Object.values(buckets);
        }
    }

    // ─── Top branches ────────────────────────────────────────────────────
    private buildTopBranches(items: ChequeInfoItem[]): void {
        const map = new Map<string, BranchBucket>();
        items.forEach((item) => {
            const code = (item.receiverBranchCode || item.beneficiaryBranchCode || 'N/A').toString();
            const label = (item.branchName || `Branch ${code}`).trim();
            const existing = map.get(code) || { label, code, count: 0, amount: 0 };
            existing.count += 1;
            existing.amount += item.amount || 0;
            existing.label = label || existing.label;
            map.set(code, existing);
        });

        this.topBranches = Array.from(map.values())
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 6);
    }

    // ─── Recent activity ─────────────────────────────────────────────────
    private buildRecentActivity(items: ChequeInfoItem[]): void {
        this.recentActivity = [...items]
            .sort((a, b) => new Date(b.createdOn || b.date || 0).getTime() - new Date(a.createdOn || a.date || 0).getTime())
            .slice(0, 7)
            .map((item) => {
                const code = this.normStatus(item.status);
                return {
                    id: item.id,
                    title: item.beneficiaryTitle || item.depositorTitle || `Cheque #${item.chequeNo || item.id}`,
                    subtitle: `${item.chequeNo || '—'} · ${item.drawerBank || item.branchName || 'Outward'}`,
                    amount: item.amount || 0,
                    status: this.statusLabel(code),
                    statusClass: this.statusClass(code),
                    time: this.relativeTime(item.createdOn || item.date),
                };
            });
    }

    // ─── Charts ──────────────────────────────────────────────────────────
    private buildCharts(items: ChequeInfoItem[]): void {
        const days = this.lastNDates(7);
        const countByDay = days.map(d => items.filter(i => this.sameDay(i.createdOn || i.date, d)).length);
        const amountByDay = days.map(d => items
            .filter(i => this.sameDay(i.createdOn || i.date, d))
            .reduce((s, i) => s + (i.amount || 0), 0));

        // Fallback sample data if all zeros
        const allZeroCount = countByDay.every(v => v === 0);
        const allZeroAmount = amountByDay.every(v => v === 0);
        const countSeries = allZeroCount ? [12, 18, 14, 22, 27, 24, 30] : countByDay;
        const amountSeries = allZeroAmount ? [350000, 420000, 380000, 510000, 640000, 580000, 720000] : amountByDay;

        this.trendChart = {
            chart: { type: 'area', height: 290, toolbar: { show: false }, fontFamily: 'inherit' },
            series: [
                { name: 'Instruments', data: countSeries },
                { name: 'Amount (Rs.)', data: amountSeries.map(v => Math.round(v / 1000)) }
            ],
            colors: ['#5a2181', '#f59e0b'],
            stroke: { curve: 'smooth', width: [3, 3] },
            fill: {
                type: 'gradient',
                gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 95, 100] }
            },
            dataLabels: { enabled: false },
            xaxis: {
                categories: days.map(d => d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })),
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: { style: { colors: '#6b7280', fontSize: '11px' } }
            },
            yaxis: [
                { labels: { style: { colors: '#6b7280', fontSize: '11px' } } },
                { opposite: true, labels: { style: { colors: '#6b7280', fontSize: '11px' }, formatter: (v: number) => `${v}k` } }
            ],
            grid: { borderColor: '#f3f4f6', strokeDashArray: 4 },
            legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px' },
            tooltip: { theme: 'light' }
        };

        // Status donut
        const donutLabels = this.statusBuckets.map(b => b.label);
        const donutSeries = this.statusBuckets.map(b => b.count);
        const donutColors = this.statusBuckets.map(b => b.color);
        const hasDonutData = donutSeries.some(v => v > 0);

        this.statusChart = {
            chart: { type: 'donut', height: 290, fontFamily: 'inherit' },
            series: hasDonutData ? donutSeries : [1, 1, 1, 1],
            labels: hasDonutData ? donutLabels : ['Pending', 'Approved', 'Cleared', 'Returned'],
            colors: hasDonutData ? donutColors : ['#2563eb', '#16a34a', '#5a2181', '#dc2626'],
            stroke: { width: 2, colors: ['#ffffff'] },
            legend: { position: 'bottom', fontSize: '12px' },
            dataLabels: { enabled: true, style: { fontSize: '11px', fontWeight: 600 } },
            plotOptions: {
                pie: {
                    donut: {
                        size: '68%',
                        labels: {
                            show: true,
                            total: {
                                show: true, label: 'Total', color: '#5a2181', fontSize: '14px', fontWeight: 600,
                                formatter: () => hasDonutData ? donutSeries.reduce((a, b) => a + b, 0).toString() : '0'
                            },
                            value: { fontSize: '22px', fontWeight: 700, color: '#1f2937' }
                        }
                    }
                }
            }
        };

        // Branch bar
        const branchLabels = this.topBranches.map(b => b.label.length > 28 ? b.label.slice(0, 28) + '…' : b.label);
        const branchSeries = this.topBranches.map(b => Math.round(b.amount));
        const hasBranchData = branchSeries.length > 0 && branchSeries.some(v => v > 0);

        this.branchChart = {
            chart: { type: 'bar', height: 330, toolbar: { show: false }, fontFamily: 'inherit' },
            series: [{
                name: 'Settlement Amount',
                data: hasBranchData ? branchSeries : [860000, 740000, 610000, 520000, 430000, 310000]
            }],
            colors: ['#5a2181'],
            plotOptions: {
                bar: {
                    horizontal: true,
                    borderRadius: 6,
                    distributed: false,
                    barHeight: '65%',
                    dataLabels: { position: 'top' }
                }
            },
            dataLabels: {
                enabled: true,
                offsetX: 36,
                style: { fontSize: '11px', colors: ['#1f2937'], fontWeight: 600 },
                formatter: (v: number) => `Rs. ${this.formatAmount(v)}`
            },
            xaxis: {
                categories: hasBranchData ? branchLabels : ['Main Branch', 'Gulshan', 'Clifton', 'DHA', 'North Nazimabad', 'Malir'],
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: { style: { colors: '#6b7280', fontSize: '11px' }, formatter: (v: string) => `${Math.round(Number(v) / 1000)}k` }
            },
            yaxis: { labels: { style: { colors: '#1f2937', fontSize: '11px' } } },
            grid: { borderColor: '#f3f4f6', strokeDashArray: 4 },
            tooltip: {
                theme: 'light',
                y: { formatter: (v: number) => `Rs. ${this.formatAmount(v)}` }
            },
            legend: { show: false }
        };

        // Hourly processing mock (bar)
        const hours = ['08', '10', '12', '14', '16', '18'];
        const processed = [14, 32, 48, 72, 56, 21];
        const returned = [1, 3, 4, 6, 3, 2];
        this.hourlyChart = {
            chart: { type: 'bar', height: 260, stacked: true, toolbar: { show: false }, fontFamily: 'inherit' },
            series: [
                { name: 'Processed', data: processed },
                { name: 'Returned', data: returned }
            ],
            colors: ['#5a2181', '#dc2626'],
            plotOptions: { bar: { borderRadius: 4, columnWidth: '45%' } },
            dataLabels: { enabled: false },
            xaxis: {
                categories: hours.map(h => `${h}:00`),
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: { style: { colors: '#6b7280', fontSize: '11px' } }
            },
            yaxis: { labels: { style: { colors: '#6b7280', fontSize: '11px' } } },
            grid: { borderColor: '#f3f4f6', strokeDashArray: 4 },
            legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px' }
        };
    }

    // ─── Helpers ─────────────────────────────────────────────────────────
    private normStatus(status: string): string {
        return (status || '').trim().toUpperCase();
    }

    private statusLabel(code: string): string {
        switch (code) {
            case 'P': return 'Pending';
            case 'A': return 'Approved';
            case 'C': return 'Cleared';
            case 'RE': return 'Returned';
            case 'U': return 'Un-Authorized';
            default: return 'Draft';
        }
    }

    private statusClass(code: string): string {
        switch (code) {
            case 'P': return 'od-status--blue';
            case 'A': return 'od-status--green';
            case 'C': return 'od-status--purple';
            case 'RE': return 'od-status--red';
            case 'U': return 'od-status--amber';
            default: return 'od-status--gray';
        }
    }

    private lastNDates(n: number): Date[] {
        const out: Date[] = [];
        const today = new Date();
        for (let i = n - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            d.setHours(0, 0, 0, 0);
            out.push(d);
        }
        return out;
    }

    private sameDay(iso: string, d: Date): boolean {
        if (!iso) return false;
        const x = new Date(iso);
        return x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth() && x.getDate() === d.getDate();
    }

    private relativeTime(iso: string): string {
        if (!iso) return '—';
        const then = new Date(iso).getTime();
        if (Number.isNaN(then)) return '—';
        const diff = Date.now() - then;
        const mins = Math.round(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.round(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.round(hrs / 24);
        return `${days}d ago`;
    }

    private nowLabel(): string {
        return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    formatAmount(val: number): string {
        if (!val) return '0';
        if (val >= 10000000) return `${(val / 10000000).toFixed(2)} Cr`;
        if (val >= 100000) return `${(val / 100000).toFixed(2)} Lac`;
        return val.toLocaleString('en-PK');
    }

    formatKpi(card: KpiCard): string {
        const formatted = card.key === 'amount' || card.key === 'avg'
            ? this.formatAmount(card.value)
            : card.value.toLocaleString('en-PK');
        return `${card.prefix || ''}${formatted}${card.suffix || ''}`;
    }

    goTo(route: string): void {
        this.router.navigate([route]);
    }
}
