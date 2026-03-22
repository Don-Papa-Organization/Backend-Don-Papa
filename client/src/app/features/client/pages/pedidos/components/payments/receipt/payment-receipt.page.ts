import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Pago } from '../../../../../../../domain/orders/models/pago.model';
import { PaymentHistoryRequestDto } from '../../../../../../../domain/orders/dtos/request/payment-history.request.dto';
import { OrdersApi } from '../../../../../../../services/apis/orders.api';
import { SharedModule } from '../../../../../../../shared/shared-module';

@Component({
  selector: 'app-payment-receipt-page',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './payment-receipt.page.html',
  styleUrl: './payment-receipt.page.scss'
})
export class PaymentReceiptPage implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  pagos: Pago[] = [];

  loading = true;
  loadingMore = false;
  descargando = false;
  error = '';

  page = 1;
  totalPages = 1;
  readonly limit = 10;

  constructor(private readonly ordersApi: OrdersApi) {}

  ngOnInit(): void {
    this.cargarHistorial(1, false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get vacio(): boolean {
    return !this.loading && !this.error && this.pagos.length === 0;
  }

  get puedeCargarMas(): boolean {
    return this.page < this.totalPages;
  }

  reintentar(): void {
    this.cargarHistorial(1, false);
  }

  cargarMas(): void {
    if (!this.puedeCargarMas || this.loading || this.loadingMore) {
      return;
    }

    this.cargarHistorial(this.page + 1, true);
  }

  descargarRecibo(pago: Pago): void {
    if (!pago.idPago || this.descargando) {
      return;
    }

    this.descargando = true;

    this.ordersApi
      .downloadReceipt(pago.idPago)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (buffer) => {
          const blob = new Blob([buffer], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `recibo-${pago.idPago}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.descargando = false;
        },
        error: (error) => {
          console.error('Error al descargar recibo:', error);
          this.descargando = false;
        }
      });
  }

  formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(valor) || 0);
  }

  formatoFecha(valor: string): string {
    const date = new Date(valor);

    if (Number.isNaN(date.getTime())) {
      return valor;
    }

    return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  private cargarHistorial(page: number, append: boolean): void {
    if (append) {
      this.loadingMore = true;
    } else {
      this.loading = true;
      this.error = '';
    }

    const dto: PaymentHistoryRequestDto = {
      page,
      limit: this.limit
    };

    this.ordersApi
      .getPaymentHistory(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.error = response.message || 'No se pudo cargar el historial de pagos.';
            this.loading = false;
            this.loadingMore = false;
            return;
          }

          const items = response.data || [];
          const pagination = response.pagination;

          this.page = page;
          this.totalPages = pagination?.totalPages || page;

          if (append) {
            this.pagos = [...this.pagos, ...items];
          } else {
            this.pagos = items;
          }

          this.loading = false;
          this.loadingMore = false;
        },
        error: (error) => {
          this.error = error?.message || 'No se pudo cargar el historial de pagos.';
          this.loading = false;
          this.loadingMore = false;
        }
      });
  }
}
