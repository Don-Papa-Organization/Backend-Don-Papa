import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-misc-metrics-section',
  standalone: false,
  templateUrl: './misc-metrics-section.html',
  styleUrl: './misc-metrics-section.scss'
})
export class MiscMetricsSectionComponent {
  @Input() promotionsLoading = false;
  @Input() promotionsError: string | null = null;
  @Input() promotionsRows: Array<Record<string, string | number>> = [];

  @Input() frequentUsersLoading = false;
  @Input() frequentUsersError: string | null = null;
  @Input() frequentUsersRows: Array<Record<string, string | number>> = [];
}