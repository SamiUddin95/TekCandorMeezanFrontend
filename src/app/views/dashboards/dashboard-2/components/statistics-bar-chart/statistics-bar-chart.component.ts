import { Component, Input } from '@angular/core';
import { EchartComponent } from '@app/components/echart.component';
import { StatisticsWidgetType } from '@/app/views/dashboards/dashboard-2/types';
import { getColor } from "@/app/utils/color-utils";
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-statistics-bar-chart',
  imports: [EchartComponent],
  templateUrl: './statistics-bar-chart.component.html',
  styleUrl: './statistics-bar-chart.component.scss'
})
export class StatisticsBarChartComponent {
  @Input() statistics: StatisticsWidgetType[] = [];

  getChartOptions = (): EChartsOption => {
    console.log('Statistics data:', this.statistics);
    
    const data = this.statistics.map(stat => ({
      name: stat.title,
      value: stat.value,
      color: this.getStatusColor(stat.title)
    }));
    
    console.log('Chart data:', data);

    return {
      legend: {
        data: data.map(item => ({
          name: item.name,
          itemStyle: {
            color: item.color
          }
        })),
        top: 10,
        left: 'center',
        textStyle: {
          color: '#374151',
          fontSize: 10,
          fontWeight: 500
        },
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 10,
        icon: 'circle',
        orient: 'horizontal',
        formatter: function(name: string) {
          return name;
        }
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: {
          color: '#374151',
          fontSize: 13
        },
        padding: [10, 15],
        formatter: function(params: any) {
          return `<strong>${params.name}</strong><br/>${params.marker} <strong>${params.value}</strong> Cheques`;
        }
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '10%',
        top: '25%',
        containLabel: false
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.name),
        axisLabel: {
          show: false
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          fontSize: 11,
          color: '#6b7280',
          fontWeight: 500
        },
        splitLine: {
          lineStyle: {
            color: '#f3f4f6',
            type: 'dashed'
          }
        },
        axisLine: {
          show: false
        }
      },
      series: [
        {
          name: 'Cheques',
          type: 'bar',
          barWidth: '50%',
          barGap: '50%',
          data: data.map(item => ({
            name: item.name,
            value: item.value,
            itemStyle: {
              color: item.color,
              borderRadius: [6, 6, 0, 0]
            }
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          },
          label: {
            show: false
          }
        }
      ]
    };
  }

  private getStatusColor(title: string): string {
    const colors: { [key: string]: string } = {
      'Approved': '#22c55e',
      'In Process': '#3b82f6', 
      'Pending': '#f59e0b',
      'Return': '#06b6d4',
      'System Rejected': '#ef4444',
      'Un Authorized': '#6b7280'
    };
    return colors[title] || '#8b5cf6';
  }
}
