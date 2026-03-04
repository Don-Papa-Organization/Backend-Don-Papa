import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  standalone: false,
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.scss'
})
export class MetricCardComponent {
  @Input() label: string = '';
  @Input() value: string | number = '-';
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() isLoading = false;
}
