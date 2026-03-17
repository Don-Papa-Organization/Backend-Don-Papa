import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { RegisterPaymentRequestDto } from '../../../../../../domain/orders/dtos/request/register-payment.request.dto';
import { PendingPaymentOrderViewModel } from '../../services/orders.facade';

@Component({
	selector: 'app-registrar-pago-form',
	standalone: false,
	templateUrl: './registrar-pago-form.html',
	styleUrl: './registrar-pago-form.scss'
})
export class RegistrarPagoFormComponent implements OnChanges {
	@Input() mostrar = false;
	@Input() pedidoSeleccionado: PendingPaymentOrderViewModel | null = null;
	@Input() metodosPagoOptions: Array<{ value: any; label: string }> = [];
	@Output() cerrar = new EventEmitter<void>();
	@Output() pagoRegistrado = new EventEmitter<RegisterPaymentRequestDto>();

	formSubmitted = false;
	idMetodoPago: number | null = null;
	direccionEntrega = '';
	montoRecibidoEfectivo: number | null = null;
	modoMixto = false;
	lineasPago: Array<{ idMetodoPago: number | null; monto: number | null }> = [
		{ idMetodoPago: null, monto: null }
	];
	mensajeError: string | null = null;

	private normalizeMetodoNombre(nombre: string): string {
		return nombre
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.trim();
	}

	private getMetodoNombreById(idMetodoPago: number | null): string {
		if (!idMetodoPago) return '';
		const metodo = this.metodosPagoOptions.find(option => Number(option.value) === Number(idMetodoPago));
		return typeof metodo?.label === 'string' ? metodo.label : '';
	}

	private isMetodoEfectivo(idMetodoPago: number | null): boolean {
		const nombre = this.getMetodoNombreById(idMetodoPago);
		return this.normalizeMetodoNombre(nombre).includes('efectivo');
	}

	get totalPedido(): number {
		return Number(this.pedidoSeleccionado?.total || 0);
	}

	get tituloModalPago(): string {
		return `Registrar Pago: ${this.modoMixto ? 'Mixto' : 'Simple'}`;
	}

	get usaEfectivoEnNormal(): boolean {
		return !this.modoMixto && this.isMetodoEfectivo(this.idMetodoPago);
	}

	get montoMetodoSimple(): number {
		return 0;
	}

	get totalAsignadoActual(): number {
		return this.modoMixto ? this.totalLineasPago : this.montoMetodoSimple;
	}

	get diferenciaResumen(): number {
		if (this.usaEfectivoEnNormal && this.montoRecibidoEfectivo !== null) {
			return Number((Number(this.montoRecibidoEfectivo) - this.totalPedido).toFixed(2));
		}

		return Number((this.totalAsignadoActual - this.totalPedido).toFixed(2));
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['pedidoSeleccionado'] && this.pedidoSeleccionado) {
			this.direccionEntrega = this.pedidoSeleccionado.direccionEntrega || '';
		}
	}

	onGuardar(): void {
		this.formSubmitted = true;
		this.mensajeError = null;

		if (!this.pedidoSeleccionado) {
			return;
		}

		const totalPedido = this.totalPedido;

		if (!this.modoMixto) {
			if (!this.idMetodoPago) {
				this.mensajeError = 'Debe seleccionar un método de pago.';
				return;
			}

			if (this.usaEfectivoEnNormal) {
				if (!this.montoRecibidoEfectivo || Number(this.montoRecibidoEfectivo) <= 0) {
					this.mensajeError = 'Debe indicar el monto recibido en efectivo.';
					return;
				}

				if (this.toCents(Number(this.montoRecibidoEfectivo)) < this.toCents(totalPedido)) {
					this.mensajeError = `El monto recibido en efectivo debe ser al menos $${totalPedido.toFixed(0)}.`;
					return;
				}
			}

			const dto: RegisterPaymentRequestDto = {
				idMetodoPago: Number(this.idMetodoPago),
				montoRecibidoEfectivo: this.usaEfectivoEnNormal ? Number(this.montoRecibidoEfectivo) : undefined,
				direccionEntrega: this.direccionEntrega?.trim() || undefined
			};

			this.pagoRegistrado.emit(dto);
			return;
		}

		const lineasValidas = this.lineasPago
			.filter(linea => linea.idMetodoPago !== null || linea.monto !== null)
			.map(linea => ({
				idMetodoPago: Number(linea.idMetodoPago),
				monto: Number(linea.monto)
			}));

		if (lineasValidas.length === 0) {
			this.mensajeError = 'Debe agregar al menos una línea de pago.';
			return;
		}

		for (const linea of lineasValidas) {
			if (!linea.idMetodoPago || Number.isNaN(linea.idMetodoPago)) {
				this.mensajeError = 'Cada línea debe tener un método de pago válido.';
				return;
			}

			if (!linea.monto || Number.isNaN(linea.monto) || linea.monto <= 0) {
				this.mensajeError = 'Cada línea debe tener un monto mayor a 0.';
				return;
			}
		}

		const totalLineas = this.toCents(
			lineasValidas.reduce((acc, item) => acc + Number(item.monto), 0)
		);
		const totalPedidoCentavos = this.toCents(totalPedido);

		if (totalLineas !== totalPedidoCentavos) {
			this.mensajeError = `La suma de métodos debe ser exactamente $${totalPedido.toFixed(0)}.`;
			return;
		}

		const dto: RegisterPaymentRequestDto = {
			metodos: lineasValidas,
			direccionEntrega: this.direccionEntrega?.trim() || undefined
		};

		this.pagoRegistrado.emit(dto);
	}

	onToggleModoMixto(): void {
		this.modoMixto = !this.modoMixto;
		this.formSubmitted = false;
		this.mensajeError = null;
		this.idMetodoPago = null;
		this.montoRecibidoEfectivo = null;
		this.lineasPago = [{ idMetodoPago: null, monto: null }];
	}

	onAgregarLinea(): void {
		this.lineasPago = [...this.lineasPago, { idMetodoPago: null, monto: null }];
	}

	onEliminarLinea(index: number): void {
		if (this.lineasPago.length <= 1) {
			this.lineasPago = [{ idMetodoPago: null, monto: null }];
			return;
		}

		this.lineasPago = this.lineasPago.filter((_, i) => i !== index);
	}

	get totalLineasPago(): number {
		return this.lineasPago.reduce((acc, linea) => acc + Number(linea.monto || 0), 0);
	}

	private toCents(value: number): number {
		return Math.round(Number(value) * 100);
	}

	onCerrar(): void {
		this.resetForm();
		this.cerrar.emit();
	}

	private resetForm(): void {
		this.formSubmitted = false;
		this.modoMixto = false;
		this.mensajeError = null;
		this.idMetodoPago = null;
		this.montoRecibidoEfectivo = null;
		this.lineasPago = [{ idMetodoPago: null, monto: null }];
		this.direccionEntrega = this.pedidoSeleccionado?.direccionEntrega || '';
	}
}
