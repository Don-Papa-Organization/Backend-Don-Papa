import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CreatePaymentMethodRequestDto } from '../../../../../../domain/orders/dtos/request/create-payment-method.request.dto';

@Component({
	selector: 'app-agregar-metodo-pago-form',
	standalone: false,
	templateUrl: './agregar-metodo-pago-form.html',
	styleUrl: './agregar-metodo-pago-form.scss'
})
export class AgregarMetodoPagoFormComponent {
	@Input() mostrar = false;
	@Output() cerrar = new EventEmitter<void>();
	@Output() metodoCreado = new EventEmitter<CreatePaymentMethodRequestDto>();

	formSubmitted = false;
	nombre = '';

	onGuardar(): void {
		this.formSubmitted = true;

		if (!this.nombre.trim()) {
			return;
		}

		const dto: CreatePaymentMethodRequestDto = {
			nombre: this.nombre.trim()
		};

		this.metodoCreado.emit(dto);
		this.resetForm();
	}

	onCerrar(): void {
		this.resetForm();
		this.cerrar.emit();
	}

	private resetForm(): void {
		this.formSubmitted = false;
		this.nombre = '';
	}
}
