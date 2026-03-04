import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-statistics-data-table',
  standalone: false,
  templateUrl: './statistics-data-table.html',
  styleUrl: './statistics-data-table.scss'
})
export class StatisticsDataTableComponent {
  @Input() title = '';
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() emptyMessage = 'No hay datos disponibles';
  @Input() columns: string[] = [];
  @Input() rows: Array<Record<string, string | number>> = [];
  @Output() retry = new EventEmitter<void>();

  onRetry(): void {
    this.retry.emit();
  }
}
