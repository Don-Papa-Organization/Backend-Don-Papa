import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Pedido } from '../../../domain/orders/models/pedido.model';

@Component({
  selector: 'app-ui-order-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <article class="order-item" [class.order-item--client-premium]="visualTheme === 'client-premium'">
      <div class="order-item__header">
        <div class="order-info">
          <h4 class="order-id">Pedido #{{ pedido.idPedido }}</h4>
          <p class="order-date">{{ pedido.fechaPedido | date: 'short' }}</p>
        </div>

        <div class="order-status">
          <span class="status-badge" [class]="'status-' + (pedido.estado | lowercase)">
            {{ formatEstado(pedido.estado) }}
          </span>
        </div>
      </div>

      <div class="order-item__details">
        <p class="detail-row">
          <span class="detail-label">Cantidad de productos:</span>
          <span class="detail-value">{{ cantidadProductos }}</span>
        </p>

        <p class="detail-row">
          <span class="detail-label">Total:</span>
          <span class="detail-value total">{{ formatoMoneda(pedido.total) }}</span>
        </p>
      </div>

      <div class="order-item__actions">
        <button
          type="button"
          class="download-receipt-btn"
          *ngIf="mostrarAcciones"
          (click)="onDownloadReceipt()"
          aria-label="Descargar comprobante"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </button>
        <a [routerLink]="['/client/pedidos', pedido.idPedido]" class="view-details-link">
          Ver detalles →
        </a>
      </div>
    </article>
  `,
  styleUrl: './order-item.component.scss'
})
export class UiOrderItemComponent {
  @Input() pedido!: Pedido;
  @Input() cantidadProductos: number = 0;
  @Input() mostrarAcciones = false;
  @Input() visualTheme: 'default' | 'client-premium' = 'default';

  @Output() downloadReceipt = new EventEmitter<number>();

  formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor || 0);
  }

  formatEstado(estado: string): string {
    const estados: { [key: string]: string } = {
      'sin_confirmar': 'Sin confirmar',
      'pendiente': 'En progreso',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    };
    return estados[estado.toLowerCase()] || estado;
  }

  onDownloadReceipt(): void {
    this.downloadReceipt.emit(this.pedido.idPedido);
  }
}
