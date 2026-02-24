import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ui-helper-text',
  standalone: false,
  templateUrl: './ui-helper-text.html',
  styleUrl: './ui-helper-text.scss'
})
export class UiHelperText {
  @Input() type: 'error' | 'success' | 'info' = 'error';
  @Input() visible: boolean = true;

  constructor() { }
}

