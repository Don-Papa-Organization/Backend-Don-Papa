import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-table-sale-footer-actions',
  standalone: false,
  templateUrl: './table-sale-footer-actions.html',
  styleUrl: './table-sale-footer-actions.scss'
})
export class TableSaleFooterActionsComponent {
  @Input() totalPedido = 0;
  @Input() lineasCount = 0;
  @Input() autoImpresion = true;
  @Input() reciboPendienteId: number | null = null;
  @Input() procesando = false;
  @Input() descargandoRecibo = false;

  @Output() descargarReciboPendiente = new EventEmitter<void>();
  @Output() abrirPago = new EventEmitter<void>();

  get canPagar(): boolean {
    return !this.procesando && this.lineasCount > 0;
  }
}
