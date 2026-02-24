import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Pedido, EstadoPedido } from '../../../../../../domain/orders/models/pedido.model';
import { UpdateOrderStatusRequestDto } from '../../../../../../domain/orders/dtos/request/update-order-status.request.dto';

@Component({
	selector: 'app-editar-order-form',
	standalone: false,
	templateUrl: './editar-order-form.html',
	styleUrl: './editar-order-form.scss'
})
export class EditarOrderFormComponent implements OnChanges {
	@Input() mostrar = false;
	@Input() pedidoSeleccionado: Pedido | null = null;
	@Output() cerrar = new EventEmitter<void>();
	@Output() pedidoActualizado = new EventEmitter<UpdateOrderStatusRequestDto>();

	formSubmitted = false;

	// Datos del formulario
	pedidoEditado = {
		idPedido: 0,
		estado: EstadoPedido.PENDIENTE as string,
		direccionEntrega: '',
		total: 0
	};

	// Opciones de estado
	estadosDisponibles = [
		{ value: EstadoPedido.SIN_CONFIRMAR, label: 'Sin Confirmar' },
		{ value: EstadoPedido.PENDIENTE, label: 'Pendiente' },
		{ value: EstadoPedido.ENTREGADO, label: 'Entregado' },
		{ value: EstadoPedido.CANCELADO, label: 'Cancelado' }
	];

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['pedidoSeleccionado'] && this.pedidoSeleccionado) {
			this.cargarDatosPedido();
		}
	}

	/**
	 * Carga los datos del pedido en el formulario
	 */
	private cargarDatosPedido(): void {
		if (!this.pedidoSeleccionado) return;

		this.pedidoEditado = {
			idPedido: this.pedidoSeleccionado.idPedido,
			estado: this.pedidoSeleccionado.estado,
			direccionEntrega: this.pedidoSeleccionado.direccionEntrega || '',
			total: this.pedidoSeleccionado.total
		};
	}

	/**
	 * Guarda los cambios del pedido
	 */
	onGuardar(): void {
		this.formSubmitted = true;
		if (!this.validarFormulario()) {
			return;
		}

		const dto: UpdateOrderStatusRequestDto = {
			nuevoEstado: this.pedidoEditado.estado as EstadoPedido
		};

		this.pedidoActualizado.emit(dto);
		this.resetForm();
	}

	/**
	 * Cierra el modal
	 */
	onCerrar(): void {
		this.resetForm();
		this.cerrar.emit();
	}

	/**
	 * Valida el formulario
	 */
	private validarFormulario(): boolean {
		if (!this.pedidoEditado.estado) {
			return false;
		}

		return true;
	}

	/**
	 * Reinicia el formulario
	 */
	private resetForm(): void {
		this.formSubmitted = false;
		this.pedidoEditado = {
			idPedido: 0,
			estado: EstadoPedido.PENDIENTE,
			direccionEntrega: '',
			total: 0
		};
	}
}
