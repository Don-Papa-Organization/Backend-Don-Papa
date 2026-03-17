import { Component, OnInit } from '@angular/core';

interface PagoVisual {
  metodo: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  monto: number;
  fecha: Date;
}

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

  private pagosDelSistema: PagoVisual[] = [];

  ngOnInit(): void {
    this.generarPagosVisuales();
    this.actualizarHoraColombia();
    this.calcularDineroEfectivo();
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

  private calcularDineroEfectivo(): void {
    const hoyBogota = this.getDateKeyInBogota(new Date());

    this.dineroEfectivo = this.pagosDelSistema
      .filter((pago) => pago.metodo === 'EFECTIVO')
      .filter((pago) => this.getDateKeyInBogota(pago.fecha) === hoyBogota)
      .reduce((acc, pago) => acc + pago.monto, 0);
  }

  private getDateKeyInBogota(date: Date): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: this.colombiaTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  }

  private generarPagosVisuales(): void {
    const ahora = new Date();

    this.pagosDelSistema = [
      { metodo: 'EFECTIVO', monto: 180000, fecha: new Date(ahora.getTime() - 1000 * 60 * 60 * 1) },
      { metodo: 'EFECTIVO', monto: 95000, fecha: new Date(ahora.getTime() - 1000 * 60 * 60 * 4) },
      { metodo: 'EFECTIVO', monto: 120000, fecha: new Date(ahora.getTime() - 1000 * 60 * 60 * 8) },
      { metodo: 'TARJETA', monto: 210000, fecha: new Date(ahora.getTime() - 1000 * 60 * 60 * 2) },
      { metodo: 'TRANSFERENCIA', monto: 60000, fecha: new Date(ahora.getTime() - 1000 * 60 * 60 * 3) },
      { metodo: 'EFECTIVO', monto: 140000, fecha: new Date(ahora.getTime() - 1000 * 60 * 60 * 28) }
    ];
  }
}
