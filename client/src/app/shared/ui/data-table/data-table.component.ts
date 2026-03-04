import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-data-table',
  standalone: false,
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent {
  @Input() columns: string[] = [];
  @Input() data: any[] = [];
  @Input() isLoading = false;
  @Input() hasError = false;
  @Input() errorMessage = 'Ocurrió un error al cargar los datos';
  @Input() emptyMessage = 'No hay datos disponibles';

  @Output() onRetry = new EventEmitter<void>();

  getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }
}
