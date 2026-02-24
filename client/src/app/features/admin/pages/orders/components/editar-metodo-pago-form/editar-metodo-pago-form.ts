import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UpdatePaymentMethodRequestDto } from '../../../../../../domain/orders/dtos/request/update-payment-method.request.dto';
import { PaymentMethodViewModel } from '../../services/orders.facade';

@Component({
	selector: 'app-editar-metodo-pago-form',
	standalone: false,
	templateUrl: './editar-metodo-pago-form.html',
	styleUrl: './editar-metodo-pago-form.scss'
})
export class EditarMetodoPagoFormComponent implements OnChanges {
	@Input() mostrar = false;
	@Input() metodoSeleccionado: PaymentMethodViewModel | null = null;
	@Output() cerrar = new EventEmitter<void>();
	@Output() metodoActualizado = new EventEmitter<UpdatePaymentMethodRequestDto>();

	formSubmitted = false;
	nombre = '';

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['metodoSeleccionado'] && this.metodoSeleccionado) {
			this.nombre = this.metodoSeleccionado.nombre;
		}
	}

	onGuardar(): void {
		this.formSubmitted = true;

		if (!this.nombre.trim()) {
			return;
		}

		const dto: UpdatePaymentMethodRequestDto = {
			nombre: this.nombre.trim()
		};

		this.metodoActualizado.emit(dto);
		this.resetForm();
	}

	onCerrar(): void {
		this.resetForm();
		this.cerrar.emit();
	}

	private resetForm(): void {
		this.formSubmitted = false;
		this.nombre = this.metodoSeleccionado?.nombre ?? '';
	}
}
