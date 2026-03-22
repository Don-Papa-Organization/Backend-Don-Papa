import { CommonModule, Location } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Pedido } from '../../../../../../../domain/orders/models/pedido.model';
import { OrdersApi } from '../../../../../../../services/apis/orders.api';
import { SharedModule } from '../../../../../../../shared/shared-module';

@Component({
  selector: 'app-order-status-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './order-status.page.html',
  styleUrl: './order-status.page.scss'
})
export class OrderStatusPage implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  idPedidoInput = '';

  loading = false;
  error = '';
  resultado: Pedido | null = null;

  constructor(
    private readonly ordersApi: OrdersApi,
    private readonly location: Location
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  volverInicio(): void {
    this.location.back();
  }

  consultarEstado(): void {
    const idPedido = Number(this.idPedidoInput);

    if (!idPedido || Number.isNaN(idPedido)) {
      this.error = 'Ingresa un id de pedido valido.';
      this.resultado = null;
      return;
    }

    this.loading = true;
    this.error = '';
    this.resultado = null;

    this.ordersApi
      .checkOrderStatus(idPedido)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.error = response.message || 'No se pudo consultar el estado del pedido.';
            this.loading = false;
            return;
          }

          this.resultado = response.data;
          this.loading = false;
        },
        error: (error) => {
          this.error = error?.message || 'No se pudo consultar el estado del pedido.';
          this.loading = false;
        }
      });
  }

  limpiarConsulta(): void {
    this.idPedidoInput = '';
    this.resultado = null;
    this.error = '';
  }

  formatoFecha(valor: string): string {
    const date = new Date(valor);

    if (Number.isNaN(date.getTime())) {
      return valor;
    }

    return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }
}

