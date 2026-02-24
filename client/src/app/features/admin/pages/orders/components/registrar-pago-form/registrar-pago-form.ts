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

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['pedidoSeleccionado'] && this.pedidoSeleccionado) {
			this.direccionEntrega = this.pedidoSeleccionado.direccionEntrega || '';
		}
	}

	onGuardar(): void {
		this.formSubmitted = true;

		if (!this.idMetodoPago) {
			return;
		}

		const dto: RegisterPaymentRequestDto = {
			idMetodoPago: Number(this.idMetodoPago),
			direccionEntrega: this.direccionEntrega?.trim() || undefined
		};

		this.pagoRegistrado.emit(dto);
		this.resetForm();
	}

	onCerrar(): void {
		this.resetForm();
		this.cerrar.emit();
	}

	private resetForm(): void {
		this.formSubmitted = false;
		this.idMetodoPago = null;
		this.direccionEntrega = this.pedidoSeleccionado?.direccionEntrega || '';
	}
}
