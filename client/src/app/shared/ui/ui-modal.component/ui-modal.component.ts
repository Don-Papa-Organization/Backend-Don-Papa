import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-ui-modal',
  standalone: false,
  templateUrl: './ui-modal.component.html',
  styleUrl: './ui-modal.component.scss'
})
export class UiModalComponent {
  @Input() titulo: string = '';
  @Input() mostrar: boolean = false;
  @Input() width: string = 'auto';
  @Input() maxWidth: string = '80%';
  @Input() maxHeight: string = '85vh';
  @Input() padding: string = '20px';
  @Input() tone: 'default' | 'primary-surface' | 'client-premium' = 'default';
  @Input() closeOnBackdrop: boolean = true;


  @Output() cerrar = new EventEmitter<void>();

  get containerStyles(): Record<string, string> {
    return {
      width: this.width,
      'max-width': this.maxWidth,
      'max-height': this.maxHeight,
      padding: this.padding
    };
  }

  get containerClasses(): string[] {
    return [
      'modal-container',
      `modal-container--${this.tone}`
    ];
  }


  onCerrar() {
    this.cerrar.emit();
  }

  onBackdropClick(): void {
    if (!this.closeOnBackdrop) {
      return;
    }

    this.onCerrar();
  }
}