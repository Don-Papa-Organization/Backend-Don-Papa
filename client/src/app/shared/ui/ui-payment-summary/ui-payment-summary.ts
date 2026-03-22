import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ui-payment-summary',
  standalone: false,
  templateUrl: './ui-payment-summary.html',
  styleUrl: './ui-payment-summary.scss'
})
export class UiPaymentSummary {
  @Input() totalPagar = 0;
  @Input() diferencia = 0;
  @Input() visualTheme: 'default' | 'client-premium' = 'default';

  formatSigned(value: number): string {
    const sign = value >= 0 ? '+' : '-';
    return `${sign}$${Math.abs(value).toFixed(2)}`;
  }
}
