import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { EChartsOption } from 'echarts';
import Swal from 'sweetalert2';
import { LiveMonitoringService, LiveMonitoringResponse, MonitoringRecord } from '../../../services/live-monitoring.service';
import { SpinnerComponent } from '@app/components/spinner/spinner.component';
import { PageTitleComponent } from '@app/components/page-title.component';
import { CountUpModule } from 'ngx-countup';
import { EchartComponent } from '@app/components/echart.component';

export type MonitoringWidgetType = {
  title: string;
  badge?: {
    text: string;
    variant: 'success' | 'primary' | 'info' | 'warning' | 'danger' | 'secondary';
  };
  value: number;
  description: string;
};

@Component({
  selector: 'app-live-monitoring',
  imports: [CommonModule, SpinnerComponent, PageTitleComponent, CountUpModule, EchartComponent],
  templateUrl: './live-monitoring.component.html',
  styleUrl: './live-monitoring.component.scss'
})
export class LiveMonitoringComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  monitoringWidgets: MonitoringWidgetType[] = [];
  signatureWidgets: MonitoringWidgetType[] = [];

  // Chart options
  barChartOptions!: () => EChartsOption;
  monitoringPieOptions!: () => EChartsOption;
  signaturePieOptions!: () => EChartsOption;

  // Raw data for charts
  private monitoringData: MonitoringRecord[] = [];
  private signaturesData: MonitoringRecord[] = [];
  
  private subscriptions = new Subscription();

  constructor(private liveMonitoringService: LiveMonitoringService) {}

  ngOnInit() {
    this.loadMonitoringData();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadMonitoringData() {
    this.isLoading = true;
    
    this.subscriptions.add(
      this.liveMonitoringService.getMonitoringData().subscribe({
        next: (response: LiveMonitoringResponse) => {
          if (response.status === 'success' && response.data) {
            this.monitoringData = response.data.monitoring || [];
            this.signaturesData = response.data.signatures || [];
            this.transformDataToWidgets(this.monitoringData, this.signaturesData);
            this.buildCharts();
          } else {
            Swal.fire({ icon: 'error', title: 'Error', text: response.errorMessage || 'Failed to load monitoring data' });
          }
          this.isLoading = false;
        },
        error: () => {
          Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load monitoring data. Please try again.' });
          this.isLoading = false;
        }
      })
    );
  }

  private transformDataToWidgets(monitoring: MonitoringRecord[], signatures: MonitoringRecord[]) {
    this.monitoringWidgets = monitoring.map(record => ({
      title: 'Monitoring',
      badge: { text: record.records, variant: this.getBadgeVariant(record.records) },
      value: record.count,
      description: record.records
    }));
    this.signatureWidgets = signatures.map(record => ({
      title: 'Signatures',
      badge: { text: record.records, variant: this.getBadgeVariant(record.records) },
      value: record.count,
      description: record.records
    }));
  }

  private buildCharts() {
    const monLabels = this.monitoringData.map(r => r.records);
    const monValues = this.monitoringData.map(r => r.count);
    const sigLabels = this.signaturesData.map(r => r.records);
    const sigValues = this.signaturesData.map(r => r.count);

    // Meezan Bank theme colours
    const MEEZAN_PURPLE  = '#5a2181';   // primary deep purple
    const MEEZAN_LIGHT   = '#9c59c3';   // lighter purple accent
    const PENDING_COLOR  = '#f59e0b';   // amber for pending
    const SUCCESS_COLOR  = '#16a34a';   // green for successful

    // --- Bar Chart — one solid colour per series so legend matches ---
    const allLabels = Array.from(new Set([...monLabels, ...sigLabels]));

    this.barChartOptions = (): EChartsOption => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) =>
          params.map((p: any) => `${p.marker} ${p.seriesName} – ${p.name}: <b>${p.value}</b>`).join('<br/>')
      },
      legend: {
        data: ['Monitoring', 'Signatures'],
        bottom: 0,
        textStyle: { fontSize: 12, color: '#374151' },
        icon: 'roundRect'
      },
      grid: { top: 16, right: 16, bottom: 44, left: 48 },
      xAxis: {
        type: 'category',
        data: allLabels,
        axisLabel: { fontSize: 11, color: '#4b5563', interval: 0 },
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#e5e7eb' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 11, color: '#4b5563' },
        splitLine: { lineStyle: { color: '#f3f4f6' } },
        axisLine: { show: false }
      },
      series: [
        {
          name: 'Monitoring',
          type: 'bar',
          barMaxWidth: 40,
          barGap: '15%',
          data: allLabels.map(l => {
            const idx = monLabels.indexOf(l);
            return idx >= 0 ? monValues[idx] : 0;
          }),
          itemStyle: { color: MEEZAN_PURPLE, borderRadius: [4, 4, 0, 0] },
          label: { show: true, position: 'top', fontSize: 11, fontWeight: 'bold', color: MEEZAN_PURPLE }
        },
        {
          name: 'Signatures',
          type: 'bar',
          barMaxWidth: 40,
          data: allLabels.map(l => {
            const idx = sigLabels.indexOf(l);
            return idx >= 0 ? sigValues[idx] : 0;
          }),
          itemStyle: { color: MEEZAN_LIGHT, borderRadius: [4, 4, 0, 0] },
          label: { show: true, position: 'top', fontSize: 11, fontWeight: 'bold', color: MEEZAN_LIGHT }
        }
      ]
    });

    // --- Monitoring Pie (pending=amber, successful=green) ---
    this.monitoringPieOptions = (): EChartsOption => ({
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: {
        bottom: 4,
        textStyle: { fontSize: 11, color: '#4b5563' },
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10
      },
      series: [{
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        emphasis: {
          itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,.2)' },
          label: { show: true, fontSize: 13, fontWeight: 'bold' }
        },
        data: this.monitoringData.map(r => ({
          name: r.records,
          value: r.count,
          itemStyle: { color: r.records.toLowerCase().includes('pending') ? PENDING_COLOR : SUCCESS_COLOR }
        }))
      }]
    });

    // --- Signatures Pie (pending=light purple, successful=deep purple) ---
    this.signaturePieOptions = (): EChartsOption => ({
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: {
        bottom: 4,
        textStyle: { fontSize: 11, color: '#4b5563' },
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10
      },
      series: [{
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        emphasis: {
          itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,.2)' },
          label: { show: true, fontSize: 13, fontWeight: 'bold' }
        },
        data: this.signaturesData.map(r => ({
          name: r.records,
          value: r.count,
          itemStyle: { color: r.records.toLowerCase().includes('pending') ? MEEZAN_LIGHT : MEEZAN_PURPLE }
        }))
      }]
    });
  }

  private getBadgeVariant(recordType: string): 'success' | 'primary' | 'info' | 'warning' | 'danger' | 'secondary' {
    if (recordType.toLowerCase().includes('pending')) return 'warning';
    if (recordType.toLowerCase().includes('successful')) return 'success';
    return 'secondary';
  }

  get monitoringTotal(): number {
    return this.monitoringData.reduce((s, r) => s + r.count, 0);
  }

  get signaturesTotal(): number {
    return this.signaturesData.reduce((s, r) => s + r.count, 0);
  }
}
