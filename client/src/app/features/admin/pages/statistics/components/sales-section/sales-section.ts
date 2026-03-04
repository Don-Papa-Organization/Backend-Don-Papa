import { Component, Input } from '@angular/core';
import { StatisticMetricItem } from '../statistics-metrics-grid/statistics-metrics-grid';

@Component({
  selector: 'app-sales-section',
  standalone: false,
  templateUrl: './sales-section.html',
  styleUrl: './sales-section.scss'
})
export class SalesSectionComponent {
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() metrics: StatisticMetricItem[] = [];
  @Input() timelineRows: Array<Record<string, string | number>> = [];
}
