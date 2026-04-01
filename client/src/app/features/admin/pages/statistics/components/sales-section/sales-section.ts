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
  @Input() weeklySalesLabels: string[] = [];
  @Input() weeklySalesData: number[] = [];
  
  // Nuevos inputs para gráficos comparativos
  @Input() weeklyComparisonLabels: string[] = [];
  @Input() weeklyCurrentData: number[] = [];
  @Input() weeklyPreviousData: number[] = [];
  @Input() currentWeekLabel = 'Semana Actual';
  @Input() previousWeekLabel = 'Semana Anterior';
  
  // Nuevos inputs para gráfico físico vs web
  @Input() ventasFisico: number = 0;
  @Input() ventasWeb: number = 0;

  pageSize = 5;
  currentPage = 1;

  get paginatedTimeline(): Array<Record<string, string | number>> {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.timelineRows.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.timelineRows.length / this.pageSize);
  }

  get hasMorePages(): boolean {
    return this.currentPage < this.totalPages;
  }

  get hasPreviousPages(): boolean {
    return this.currentPage > 1;
  }

  nextPage(): void {
    if (this.hasMorePages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.hasPreviousPages) {
      this.currentPage--;
    }
  }
}