import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

export type ChartDisplayType = 'bar' | 'line' | 'doughnut' | 'pie';

@Component({
  selector: 'app-statistics-chart',
  standalone: false,
  templateUrl: './statistics-chart.html',
  styleUrl: './statistics-chart.scss'
})
export class StatisticsChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() title = '';
  @Input() type: ChartDisplayType = 'bar';
  @Input() labels: string[] = [];
  @Input() data: number[] = [];
  @Input() label = 'Valor';
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() backgroundColors: string[] = [];
  @Input() height = 250;

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;
  private chartCreated = false;
  private updateTimeout: any = null;
  private lastDataLength = 0;

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.chartCanvas && this.data && this.data.length > 0) {
        this.createChart();
      }
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.chartCanvas) return;
    
    const dataChanged = changes['data'] && changes['data'].currentValue !== changes['data'].previousValue;
    const labelsChanged = changes['labels'] && changes['labels'].currentValue !== changes['labels'].previousValue;
    
    if (!dataChanged && !labelsChanged) return;
    
    if (this.data && this.data.length > 0) {
      if (this.updateTimeout) {
        clearTimeout(this.updateTimeout);
      }
      
      this.updateTimeout = setTimeout(() => {
        if (this.chartCreated) {
          this.updateChart();
        } else {
          this.createChart();
        }
      }, 50);
    } else if (this.data && this.data.length === 0 && this.chart) {
      this.destroyChart();
    }
  }

  ngOnDestroy(): void {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    this.destroyChart();
  }

  private destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
      this.chartCreated = false;
    }
  }

  private createChart(): void {
    if (!this.chartCanvas) return;
    if (!this.data || this.data.length === 0) return;
    if (!this.labels || this.labels.length === 0) return;

    if (this.data.length === this.lastDataLength && this.chartCreated) {
      return;
    }
    this.lastDataLength = this.data.length;

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const isDoughnut = this.type === 'doughnut' || this.type === 'pie';

    const config: ChartConfiguration = {
      type: this.type as ChartType,
      data: {
        labels: this.labels,
        datasets: [{
          label: this.label,
          data: this.data,
          backgroundColor: this.getBackgroundColor(),
          borderColor: this.getBorderColor(),
          borderWidth: isDoughnut ? 2 : 1,
          tension: this.type === 'line' ? 0.3 : 0,
          fill: this.type === 'line' ? false : undefined
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: {
            display: isDoughnut,
            position: 'bottom',
            labels: {
              color: '#ffffff',
              padding: 15,
              font: { size: 12 }
            }
          },
          title: {
            display: false
          }
        },
        scales: isDoughnut ? undefined : {
          x: {
            ticks: { color: '#ffffff', font: { size: 11 }, maxRotation: 45, minRotation: 0 },
            grid: { color: 'rgba(255,255,255,0.1)' }
          },
          y: {
            ticks: { color: '#ffffff', font: { size: 11 } },
            grid: { color: 'rgba(255,255,255,0.1)' },
            beginAtZero: true
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
    this.chartCreated = true;
  }

  private updateChart(): void {
    if (!this.chart || !this.chartCanvas) return;

    if (this.data.length === 0) {
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
        this.chartCreated = false;
      }
      return;
    }

    this.chart.data.labels = this.labels;
    this.chart.data.datasets[0].data = this.data;
    this.chart.data.datasets[0].label = this.label;
    this.chart.update('none');
  }

  private getBackgroundColor(): string[] {
    if (this.backgroundColors && this.backgroundColors.length > 0) {
      return this.backgroundColors;
    }

    if (this.type === 'doughnut' || this.type === 'pie') {
      return [
        'rgba(212, 175, 55, 0.85)',
        'rgba(255, 193, 7, 0.85)',
        'rgba(76, 175, 80, 0.85)',
        'rgba(244, 67, 54, 0.85)',
        'rgba(33, 150, 243, 0.85)',
        'rgba(156, 39, 176, 0.85)',
        'rgba(255, 152, 0, 0.85)',
        'rgba(0, 188, 212, 0.85)'
      ];
    }

    return ['rgba(212, 175, 55, 0.7)'];
  }

  private getBorderColor(): string {
    return '#D4AF37';
  }
}