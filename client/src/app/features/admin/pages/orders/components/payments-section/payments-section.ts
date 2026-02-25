import { Component, Input, Output, EventEmitter } from '@angular/core';
import { OrdersFacade, PaymentMethodViewModel, PaymentViewModel, PendingPaymentOrderViewModel } from '../../services/orders.facade';
import { AccionTabla } from '../../../../../../shared/ui/ui-tabla/ui-tabla';
import { CreatePaymentMethodRequestDto } from '../../../../../../domain/orders/dtos/request/create-payment-method.request.dto';
import { UpdatePaymentMethodRequestDto } from '../../../../../../domain/orders/dtos/request/update-payment-method.request.dto';
import { RegisterPaymentRequestDto } from '../../../../../../domain/orders/dtos/request/register-payment.request.dto';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
	selector: 'app-payments-section',
	standalone: false,
	templateUrl: './payments-section.html',
	styleUrl: './payments-section.scss'
})
export class PaymentsSectionComponent {
	@Input() cargandoPagos = false;
	@Input() pagosPendientes: PendingPaymentOrderViewModel[] = [];
	@Input() pagosTodos: PaymentViewModel[] = [];
	@Input() metodosPago: PaymentMethodViewModel[] = [];
	@Input() metodosPagoOptions: Array<{ value: any; label: string }> = [];
	@Input() metodoPagoSeleccionado: PaymentMethodViewModel | null = null;
	@Input() pedidoPagoSeleccionado: PendingPaymentOrderViewModel | null = null;

	@Output() recargarSeccion = new EventEmitter<void>();

	// Estados de modales
	mostrarModalAgregarMetodoPago = false;
	mostrarModalEditarMetodoPago = false;
	mostrarModalEliminarMetodoPago = false;
	mostrarModalMetodosPago = false;
	mostrarModalRegistrarPago = false;
	mostrarModalPreviewRecibo = false;
	reciboSeleccionado: PaymentViewModel | null = null;
	reciboURL: SafeResourceUrl | null = null;
	private reciboObjectURL: string | null = null;
	metodoPagoNombreEditado = '';
	metodoPagoSeleccionadoId: string | number | null = null;

	// Columnas de tabla
	columnasPagosPendientes = ['idPedido', 'idUsuario', 'total', 'estado', 'canalVenta', 'fechaPedido', 'direccionEntrega', 'Acciones'];
	columnasTodosPagos = ['idPago', 'idPedido', 'monto', 'fechaPago', 'metodoPago', 'Acciones'];
	columnasMetodosPago = ['idMetodoPago', 'nombre', 'Acciones'];

	// Acciones de tabla
	accionesPagosPendientes: AccionTabla[] = [
		{
			urlIcono: 'icons/agregar.svg',
			accion: (registro: PendingPaymentOrderViewModel) => this.onRegistrarPago(registro)
		}
	];

	accionesTodosPagos: AccionTabla[] = [
		{
			urlIcono: 'icons/eye.svg',
			accion: (registro: PaymentViewModel) => this.onDescargarRecibo(registro)
		}
	];

	accionesMetodosPago: AccionTabla[] = [
		{
			urlIcono: 'icons/editar.svg',
			accion: (registro: PaymentMethodViewModel) => this.onEditarMetodoPago(registro)
		},
		{
			urlIcono: 'icons/eliminar.svg',
			accion: (registro: PaymentMethodViewModel) => this.onEliminarMetodoPago(registro)
		}
	];

	constructor(private ordersFacade: OrdersFacade, private sanitizer: DomSanitizer) {}

	onAbrirModalMetodosPago(): void {
		this.mostrarModalMetodosPago = true;
	}

	onAgregarMetodoPago(): void {
		this.mostrarModalAgregarMetodoPago = true;
	}

	onMetodoPagoCreado(dto: CreatePaymentMethodRequestDto): void {
		this.ordersFacade.createPaymentMethod(dto).subscribe({
			next: () => {
				this.mostrarModalAgregarMetodoPago = false;
				this.recargarSeccion.emit();
			},
			error: (err) => {
				console.error('Error al crear método de pago:', err);
			}
		});
	}

	onEditarMetodoPago(registro: PaymentMethodViewModel): void {
		this.metodoPagoSeleccionado = registro;
		this.mostrarModalEditarMetodoPago = true;
	}

	onMetodoPagoActualizado(dto: UpdatePaymentMethodRequestDto): void {
		if (!this.metodoPagoSeleccionado) return;

		this.ordersFacade.updatePaymentMethod(this.metodoPagoSeleccionado.idMetodoPago, dto).subscribe({
			next: () => {
				this.mostrarModalEditarMetodoPago = false;
				this.recargarSeccion.emit();
			},
			error: (err) => {
				console.error('Error al actualizar método de pago:', err);
			}
		});
	}

	onMetodoPagoActualizadoDirecto(): void {
		const metodo = this.getMetodoPagoSeleccionado();
		if (!metodo || !this.metodoPagoNombreEditado) return;

		const dto: UpdatePaymentMethodRequestDto = {
			nombre: this.metodoPagoNombreEditado
		};

		this.ordersFacade.updatePaymentMethod(metodo.idMetodoPago, dto).subscribe({
			next: () => {
				this.mostrarModalMetodosPago = false;
				this.metodoPagoNombreEditado = '';
				this.metodoPagoSeleccionadoId = null;
				this.recargarSeccion.emit();
			},
			error: (err) => {
				console.error('Error al actualizar método de pago:', err);
			}
		});
	}

	onEliminarMetodoPago(registro: PaymentMethodViewModel): void {
		this.metodoPagoSeleccionado = registro;
		this.mostrarModalEliminarMetodoPago = true;
	}

	confirmarEliminarMetodoPago(): void {
		const metodo = this.getMetodoPagoSeleccionado();
		if (!metodo) return;

		this.ordersFacade.deletePaymentMethod(metodo.idMetodoPago).subscribe({
			next: () => {
				this.mostrarModalMetodosPago = false;
				this.metodoPagoNombreEditado = '';
				this.metodoPagoSeleccionadoId = null;
				this.recargarSeccion.emit();
			},
			error: (err) => {
				console.error('Error al eliminar método de pago:', err);
			}
		});
	}

	private getMetodoPagoSeleccionado(): PaymentMethodViewModel | null {
		if (this.metodoPagoSeleccionadoId === null || this.metodoPagoSeleccionadoId === undefined) {
			return null;
		}
		return this.metodosPago.find((metodo) => metodo.idMetodoPago === this.metodoPagoSeleccionadoId) ?? null;
	}

	onRegistrarPago(registro: PendingPaymentOrderViewModel): void {
		this.pedidoPagoSeleccionado = registro;
		this.mostrarModalRegistrarPago = true;
	}

	onPagoRegistrado(dto: RegisterPaymentRequestDto): void {
		if (!this.pedidoPagoSeleccionado) return;

		this.ordersFacade.registerPayment(this.pedidoPagoSeleccionado.idPedido, dto).subscribe({
			next: () => {
				this.mostrarModalRegistrarPago = false;
				this.recargarSeccion.emit();
			},
			error: (err) => {
				console.error('Error al registrar pago:', err);
			}
		});
	}

	onDescargarRecibo(registro: PaymentViewModel): void {
		this.descargarReciboPDF(registro);
	}

	private descargarReciboPDF(registro: PaymentViewModel): void {
		this.reciboSeleccionado = registro;
		this.ordersFacade.downloadReceipt(registro.idPago).subscribe({
			next: (data) => {
				const blob = new Blob([data], { type: 'application/pdf' });
				this.reciboObjectURL = window.URL.createObjectURL(blob);
				this.reciboURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.reciboObjectURL);
				this.mostrarModalPreviewRecibo = true;
			},
			error: (err) => {
				console.error('Error al descargar recibo:', err);
				alert(`Error al descargar recibo: ${err.message}`);
			}
		});
	}

	onDescargarReciboDirecto(): void {
		if (!this.reciboSeleccionado || !this.reciboObjectURL) return;
		
		const link = document.createElement('a');
		link.href = this.reciboObjectURL;
		link.download = `recibo-pago-${this.reciboSeleccionado.idPago}.pdf`;
		link.click();
	}

	cerrarModalPreviewRecibo(): void {
		if (this.reciboObjectURL) {
			window.URL.revokeObjectURL(this.reciboObjectURL);
		}
		this.mostrarModalPreviewRecibo = false;
		this.reciboSeleccionado = null;
		this.reciboURL = null;
		this.reciboObjectURL = null;
	}

	// Métodos de cierre de modales
	cerrarModalAgregarMetodoPago(): void {
		this.mostrarModalAgregarMetodoPago = false;
	}

	cerrarModalMetodosPago(): void {
		this.mostrarModalMetodosPago = false;
		this.metodoPagoSeleccionadoId = null;
		this.metodoPagoNombreEditado = '';
	}

	cerrarModalEditarMetodoPago(): void {
		this.mostrarModalEditarMetodoPago = false;
		this.metodoPagoSeleccionado = null;
		this.metodoPagoNombreEditado = '';
	}

	cerrarModalRegistrarPago(): void {
		this.mostrarModalRegistrarPago = false;
		this.pedidoPagoSeleccionado = null;
	}
}
