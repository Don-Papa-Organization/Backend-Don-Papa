import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-ui-pos-inline-feedback',
  standalone: false,
  templateUrl: './ui-pos-inline-feedback.html',
  styleUrl: './ui-pos-inline-feedback.scss'
})
export class UiPosInlineFeedback {
  @Input() visible = false;
  @Input() message = '';
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() density: 'default' | 'compact' = 'default';
  @Input() dismissible = true;

  @Output() dismiss = new EventEmitter<void>();

  get hostClasses(): string[] {
    return [
      `pos-feedback--density-${this.density}`,
      `pos-feedback--${this.type}`
    ];
  }

  get ariaLiveMode(): 'polite' | 'assertive' {
    return this.type === 'error' ? 'assertive' : 'polite';
  }
}
