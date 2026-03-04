import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-ui-chart',
  standalone: false,
  templateUrl: './ui-chart.component.html',
  styleUrl: './ui-chart.component.scss'
})
export class UiChartComponent {
  @Input() isLoading = false;
  @Input() hasError = false;
  @Input() errorMessage = 'Ocurrió un error al cargar los datos';
  @Input() isEmpty = false;
  @Input() emptyMessage = 'No hay datos disponibles para este período';

  @Output() onRetry = new EventEmitter<void>();
}
