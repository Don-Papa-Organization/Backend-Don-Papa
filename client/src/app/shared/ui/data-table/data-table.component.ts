import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent {
  @Input() title = '';
  @Input() columns: string[] = [];
  @Input() rows: Array<Record<string, unknown>> = [];
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() emptyMessage = 'No hay datos disponibles';
  @Input() minWidth = '725px';

  @Output() retry = new EventEmitter<void>();

  onRetry(): void {
    this.retry.emit();
  }
}
