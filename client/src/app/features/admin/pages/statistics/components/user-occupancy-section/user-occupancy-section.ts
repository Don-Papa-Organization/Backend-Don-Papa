import { Component, Input } from '@angular/core';
import { StatisticMetricItem } from '../statistics-metrics-grid/statistics-metrics-grid';

@Component({
  selector: 'app-user-occupancy-section',
  standalone: false,
  templateUrl: './user-occupancy-section.html',
  styleUrl: './user-occupancy-section.scss'
})
export class UserOccupancySectionComponent {
  @Input() userGrowthLoading = false;
  @Input() userGrowthError: string | null = null;
  @Input() userMetrics: StatisticMetricItem[] = [];

  @Input() occupancyLoading = false;
  @Input() occupancyError: string | null = null;
  @Input() occupancyRows: Array<Record<string, string | number>> = [];
}
