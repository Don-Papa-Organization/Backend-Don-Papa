import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-comparison-bar-chart',
  standalone: false,
  templateUrl: './comparison-bar-chart.html',
  styleUrl: './comparison-bar-chart.scss'
})
export class ComparisonBarChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() title = '';
  @Input() labels: string[] = [];
  @Input() currentData: number[] = [];
  @Input() previousData: number[] = [];
  @Input() currentLabel = 'Actual';
  @Input() previousLabel = 'Anterior';
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() height = 300;

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;
  private chartCreated = false;
  private updateTimeout: any = null;

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.chartCanvas && this.hasData()) {
        this.createChart();
      }
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.chartCanvas) return;
    
    const dataChanged = 
      changes['currentData'] || 
      changes['previousData'] || 
      changes['labels'];
    
    if (!dataChanged) return;
    
    if (this.hasData()) {
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
    } else if (this.chart) {
      this.destroyChart();
    }
  }

  ngOnDestroy(): void {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    this.destroyChart();
  }

  hasData(): boolean {
    return (
      this.labels.length > 0 && 
      (this.currentData.length > 0 || this.previousData.length > 0)
    );
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
    if (!this.hasData()) return;

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const datasets: any[] = [];

    if (this.currentData.length > 0) {
      datasets.push({
        label: this.currentLabel,
        data: this.currentData,
        backgroundColor: 'rgba(212, 175, 55, 0.8)',
        borderColor: '#D4AF37',
        borderWidth: 1
      });
    }

    if (this.previousData.length > 0) {
      datasets.push({
        label: this.previousLabel,
        data: this.previousData,
        backgroundColor: 'rgba(128, 128, 128, 0.5)',
        borderColor: '#808080',
        borderWidth: 1
      });
    }

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: this.labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: '#ffffff',
              padding: 15,
              font: { size: 12 }
            }
          },
          title: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                return `${context.dataset.label}: $${value.toLocaleString('es-CO')}`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { 
              color: '#ffffff', 
              font: { size: 11 }, 
              maxRotation: 45, 
              minRotation: 0 
            },
            grid: { color: 'rgba(255,255,255,0.1)' }
          },
          y: {
            ticks: { 
              color: '#ffffff', 
              font: { size: 11 },
              callback: (value) => `$${Number(value).toLocaleString('es-CO')}`
            },
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

    if (!this.hasData()) {
      this.destroyChart();
      return;
    }

    this.chart.data.labels = this.labels;
    
    if (this.chart.data.datasets[0]) {
      this.chart.data.datasets[0].data = this.currentData;
    }
    
    if (this.chart.data.datasets[1]) {
      this.chart.data.datasets[1].data = this.previousData;
    }
    
    this.chart.update('none');
  }
}
