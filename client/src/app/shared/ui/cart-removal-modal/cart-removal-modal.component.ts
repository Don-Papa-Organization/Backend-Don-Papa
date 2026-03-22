import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../shared-module';

@Component({
  selector: 'app-ui-cart-removal-modal',
  standalone: true,
  imports: [CommonModule, SharedModule],
  template: `
    <app-ui-modal
      [mostrar]="mostrar"
      titulo="Confirmar eliminación"
      [width]="'400px'"
      [maxWidth]="'90vw'"
      (cerrar)="onCancel()"
    >
      <div class="modal-content">
        <p class="confirmation-text">
          ¿Esta seguro de eliminar <strong>{{ productName }}</strong>?
        </p>

        <div class="modal-actions">
          <ui-button
            texto="Cancelar"
            variant="neutral"
            [noBackgroundColor]="true"
            (accion)="onCancel()"
          ></ui-button>

          <ui-button
            [texto]="isConfirming ? 'Eliminando...' : 'Eliminar'"
            variant="danger"
            [disabled]="isConfirming"
            (accion)="onConfirm()"
          ></ui-button>
        </div>
      </div>
    </app-ui-modal>
  `,
  styleUrl: './cart-removal-modal.component.scss'
})
export class UiCartRemovalModalComponent {
  @Input() mostrar: boolean = false;
  @Input() productName: string = 'producto';
  @Input() isConfirming: boolean = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
