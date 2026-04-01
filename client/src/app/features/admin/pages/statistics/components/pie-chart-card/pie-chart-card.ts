import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-pie-chart-card',
  standalone: false,
  templateUrl: './pie-chart-card.html',
  styleUrl: './pie-chart-card.scss'
})
export class PieChartCardComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() title = '';
  @Input() labels: string[] = [];
  @Input() data: number[] = [];
  @Input() colors: string[] = [];
  @Input() showLegend = true;
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() height = 250;

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;
  private chartCreated = false;
  private updateTimeout: any = null;

  private defaultColors = [
    '#D4AF37',  // Dorado principal
    '#4CAF50',  // Verde
    '#2196F3',  // Azul
    '#FF9800',  // Naranja
    '#9C27B0',  // Morado
    '#F44336',  // Rojo
    '#00BCD4',  // Cyan
    '#795548'   // Marrón
  ];

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.chartCanvas && this.hasData()) {
        this.createChart();
      }
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.chartCanvas) return;
    
    const dataChanged = changes['data'] || changes['labels'] || changes['colors'];
    
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
    return this.labels.length > 0 && this.data.length > 0;
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

    const chartColors = this.colors.length > 0 
      ? this.colors 
      : this.defaultColors.slice(0, this.labels.length);

    const total = this.data.reduce((sum, value) => sum + value, 0);

    const config: ChartConfiguration = {
      type: 'doughnut' as ChartType,
      data: {
        labels: this.labels,
        datasets: [{
          data: this.data,
          backgroundColor: chartColors,
          borderWidth: 2,
          borderColor: '#1a1a1a'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: {
            display: this.showLegend,
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
                const percentage = ((value / total) * 100).toFixed(1);
                
                if (this.title.toLowerCase().includes('venta') || 
                    this.title.toLowerCase().includes('ingreso')) {
                  return `${context.label}: $${value.toLocaleString('es-CO')} (${percentage}%)`;
                }
                return `${context.label}: ${value.toLocaleString('es-CO')} (${percentage}%)`;
              }
            }
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
    this.chart.data.datasets[0].data = this.data;
    
    if (this.colors.length > 0) {
      this.chart.data.datasets[0].backgroundColor = this.colors;
    }
    
    this.chart.update('none');
  }
}
