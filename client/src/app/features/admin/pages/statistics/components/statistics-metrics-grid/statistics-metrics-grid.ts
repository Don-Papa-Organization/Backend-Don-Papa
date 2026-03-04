import { Component, Input } from '@angular/core';

export interface StatisticMetricItem {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-statistics-metrics-grid',
  standalone: false,
  templateUrl: './statistics-metrics-grid.html',
  styleUrl: './statistics-metrics-grid.scss'
})
export class StatisticsMetricsGridComponent {
  @Input() title = '';
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() metrics: StatisticMetricItem[] = [];
}
