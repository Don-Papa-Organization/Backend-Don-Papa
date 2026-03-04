import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AnalyticsFilterDto } from '../../../../../../domain/statistics/dtos/analytics.dto';

@Component({
  selector: 'app-statistics-filters',
  standalone: false,
  templateUrl: './statistics-filters.html',
  styleUrl: './statistics-filters.scss'
})
export class StatisticsFiltersComponent {
  @Input() filters!: AnalyticsFilterDto;
  @Input() isLoading = false;

  @Output() filterChange = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();
  @Output() downloadPdf = new EventEmitter<void>();
  @Output() downloadJson = new EventEmitter<void>();
}
