import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ui-helper-text',
  standalone: false,
  templateUrl: './ui-helper-text.html',
  styleUrl: './ui-helper-text.scss'
})
export class UiHelperText {
  @Input() type: 'error' | 'success' | 'info' | 'warning' = 'error';
  @Input() visible: boolean = true;
  @Input() align: 'center' | 'left' = 'center';
  @Input() density: 'default' | 'compact' = 'default';
  @Input() stretch = false;

  constructor() { }

  get classes(): string[] {
    return [
      this.type,
      `helper-text--${this.align}`,
      `helper-text--${this.density}`,
      this.stretch ? 'helper-text--stretch' : ''
    ].filter(Boolean);
  }
}

