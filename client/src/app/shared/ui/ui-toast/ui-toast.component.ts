import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-ui-toast',
  standalone: false,
  templateUrl: './ui-toast.component.html',
  styleUrl: './ui-toast.component.scss'
})
export class UiToastComponent {
  @Input() visible = false;
  @Input() message = '';
  @Input() tone: 'warning' | 'success' | 'error' = 'warning';
  @Input() visualTheme: 'default' | 'client-premium' = 'default';
  @Input() actionLabel = '';
  @Input() closeLabel = 'Cerrar';

  @Output() action = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  onAction(): void {
    this.action.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}
