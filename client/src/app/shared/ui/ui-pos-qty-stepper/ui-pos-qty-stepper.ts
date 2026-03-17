import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-ui-pos-qty-stepper',
  standalone: false,
  templateUrl: './ui-pos-qty-stepper.html',
  styleUrl: './ui-pos-qty-stepper.scss'
})
export class UiPosQtyStepper {
  @Input() cantidad = 0;
  @Input() disabled = false;
  @Input() size: 'default' | 'compact' = 'default';
  @Input() tone: 'neutral' | 'primary' = 'neutral';

  @Output() incrementar = new EventEmitter<void>();
  @Output() decrementar = new EventEmitter<void>();

  get hostClasses(): string[] {
    return [
      `qty-stepper--${this.size}`,
      `qty-stepper--${this.tone}`
    ];
  }
}
