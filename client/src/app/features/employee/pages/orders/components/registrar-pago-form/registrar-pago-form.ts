import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { RegisterPaymentRequestDto } from '../../../../../../domain/orders/dtos/request/register-payment.request.dto';

@Component({
  selector: 'app-registrar-pago-form',
  standalone: false,
  templateUrl: './registrar-pago-form.html',
  styleUrl: './registrar-pago-form.scss'
})
export class RegistrarPagoFormComponent implements OnChanges {
  @Input() mostrar = false;
  @Input() totalPedido = 0;
  @Input() direccionEntrega = '';
  @Input() metodosPagoOptions: Array<{ value: any; label: string }> = [];

  @Output() cerrar = new EventEmitter<void>();
  @Output() pagoRegistrado = new EventEmitter<RegisterPaymentRequestDto>();

  formSubmitted = false;
  lineasPago: Array<{ idMetodoPago: number | null; monto: number | null }> = [{ idMetodoPago: null, monto: null }];
  mensajeError: string | null = null;
  private readonly metodosPermitidos = new Set(['efectivo', 'tarjeta', 'transferencia']);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mostrar'] && this.mostrar) {
      this.reiniciarFormulario();
    }
  }

  get metodosPagoPermitidos(): Array<{ value: any; label: string }> {
    return this.metodosPagoOptions.filter(option => this.metodosPermitidos.has(this.normalizeMetodo(option.label)));
  }

  get totalMetodos(): number {
    return this.lineasPago.reduce((acc, linea) => acc + Number(linea.monto || 0), 0);
  }

  get restante(): number {
    return Number((Number(this.totalPedido || 0) - this.totalMetodos).toFixed(2));
  }

  get diferencia(): number {
    return Number((this.totalMetodos - Number(this.totalPedido || 0)).toFixed(2));
  }

  get resumenEstado(): 'ok' | 'error' | 'warning' {
    if (this.canAceptar) {
      return 'ok';
    }

    if (this.totalMetodos > Number(this.totalPedido || 0)) {
      return 'error';
    }

    return 'warning';
  }

  get canAceptar(): boolean {
    const lineas = this.lineasNormalizadas();
    if (lineas.length === 0) {
      return false;
    }

    const metodosPermitidosIds = new Set(this.metodosPagoPermitidos.map(option => Number(option.value)));

    const hayLineaInvalida = lineas.some(linea => !linea.idMetodoPago || !linea.monto || Number.isNaN(linea.monto) || linea.monto <= 0);
    if (hayLineaInvalida) {
      return false;
    }

    const hayMetodoNoPermitido = lineas.some(linea => !metodosPermitidosIds.has(Number(linea.idMetodoPago)));
    if (hayMetodoNoPermitido) {
      return false;
    }

    const totalLineas = this.toCents(lineas.reduce((acc, item) => acc + item.monto, 0));
    const totalPedidoCentavos = this.toCents(Number(this.totalPedido || 0));
    return totalLineas === totalPedidoCentavos;
  }

  onAgregarLinea(): void {
    this.lineasPago = [...this.lineasPago, { idMetodoPago: null, monto: null }];
    this.mensajeError = null;
  }

  onEliminarLinea(index: number): void {
    if (this.lineasPago.length <= 1) {
      this.lineasPago = [{ idMetodoPago: null, monto: null }];
      return;
    }

    this.lineasPago = this.lineasPago.filter((_, i) => i !== index);
    this.mensajeError = null;
  }

  onLineaChange(): void {
    this.mensajeError = null;
  }

  onGuardar(): void {
    this.formSubmitted = true;
    this.mensajeError = null;

    const lineasValidas = this.lineasNormalizadas();
    const metodosPermitidosIds = new Set(this.metodosPagoPermitidos.map(option => Number(option.value)));

    if (lineasValidas.length === 0) {
      this.mensajeError = 'Debe agregar al menos una línea de pago.';
      return;
    }

    for (const linea of lineasValidas) {
      if (!linea.idMetodoPago || Number.isNaN(linea.idMetodoPago)) {
        this.mensajeError = 'Cada línea debe tener un método de pago válido.';
        return;
      }

      if (!metodosPermitidosIds.has(Number(linea.idMetodoPago))) {
        this.mensajeError = 'Solo se permiten efectivo, tarjeta o transferencia.';
        return;
      }

      if (!linea.monto || Number.isNaN(linea.monto) || linea.monto <= 0) {
        this.mensajeError = 'Cada línea debe tener un monto mayor a 0.';
        return;
      }
    }

    const totalLineas = this.toCents(lineasValidas.reduce((acc, item) => acc + item.monto, 0));
    const totalPedidoCentavos = this.toCents(Number(this.totalPedido || 0));

    if (totalLineas !== totalPedidoCentavos) {
      this.mensajeError = 'La suma debe coincidir exactamente con el total del pedido.';
      return;
    }

    const dto: RegisterPaymentRequestDto = {
      metodos: lineasValidas,
      direccionEntrega: this.direccionEntrega?.trim() || undefined
    };

    this.pagoRegistrado.emit(dto);
  }

  onCerrar(): void {
    this.reiniciarFormulario();
    this.cerrar.emit();
  }

  private toCents(value: number): number {
    return Math.round(Number(value) * 100);
  }

  private lineasNormalizadas(): Array<{ idMetodoPago: number; monto: number }> {
    return this.lineasPago
      .filter(linea => linea.idMetodoPago !== null || linea.monto !== null)
      .map(linea => ({
        idMetodoPago: Number(linea.idMetodoPago),
        monto: Number(linea.monto)
      }));
  }

  private reiniciarFormulario(): void {
    this.formSubmitted = false;
    this.mensajeError = null;
    this.lineasPago = [{ idMetodoPago: null, monto: null }];
  }

  private normalizeMetodo(nombre: string): string {
    return String(nombre)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
