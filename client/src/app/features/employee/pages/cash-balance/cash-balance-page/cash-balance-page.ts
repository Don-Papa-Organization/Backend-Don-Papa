import { Component, OnInit } from '@angular/core';
import { OrdersApi } from '../../../../../services/apis/orders.api';
import { Pago } from '../../../../../domain/orders/models/pago.model';

@Component({
  selector: 'app-cash-balance-page',
  standalone: false,
  templateUrl: './cash-balance-page.html',
  styleUrl: './cash-balance-page.scss'
})
export class CashBalancePageComponent implements OnInit {
  private readonly colombiaTimeZone = 'America/Bogota';

  dineroBase = 500000;
  gastos = 0;
  horaColombia = '';
  dineroEfectivo = 0;

  constructor(private readonly ordersApi: OrdersApi) {}

  ngOnInit(): void {
    this.actualizarHoraColombia();
    this.cargarDineroEfectivoDelDia();
  }

  get igual(): number {
    return this.dineroBase - this.gastos + this.dineroEfectivo;
  }

  formatCOP(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }

  private actualizarHoraColombia(): void {
    this.horaColombia = new Intl.DateTimeFormat('es-CO', {
      timeZone: this.colombiaTimeZone,
      dateStyle: 'full',
      timeStyle: 'short'
    }).format(new Date());
  }

  private getDateKeyInBogota(date: Date): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: this.colombiaTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date);

    const year = parts.find((p) => p.type === 'year')?.value ?? '0000';
    const month = parts.find((p) => p.type === 'month')?.value ?? '01';
    const day = parts.find((p) => p.type === 'day')?.value ?? '01';
    return `${year}-${month}-${day}`;
  }

  private cargarDineroEfectivoDelDia(): void {
    const hoyBogota = this.getDateKeyInBogota(new Date());

    this.ordersApi.getPaymentHistory({
      page: 1,
      limit: 500,
      fechaInicio: hoyBogota,
      fechaFin: hoyBogota
    }).subscribe({
      next: (response) => {
        const pagos = (response.data ?? []) as Pago[];
        this.dineroEfectivo = pagos
          .filter((pago) => this.isPagoEfectivo(pago))
          .filter((pago) => this.getDateKeyInBogota(new Date(pago.fechaPago)) === hoyBogota)
          .reduce((acc, pago) => acc + Number(pago.monto ?? 0), 0);
      },
      error: () => {
        this.dineroEfectivo = 0;
      }
    });
  }

  private isPagoEfectivo(pago: Pago): boolean {
    const nombreMetodo = (pago.metodoPago?.nombre || '').toUpperCase();
    if (nombreMetodo.includes('EFECTIVO')) {
      return true;
    }

    const detalles = pago.detalles ?? [];
    return detalles.some((d) => (d.nombre || '').toUpperCase().includes('EFECTIVO') && Number(d.monto) > 0);
  }
}
