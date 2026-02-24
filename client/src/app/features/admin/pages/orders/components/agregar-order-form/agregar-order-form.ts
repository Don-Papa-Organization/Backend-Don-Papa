import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CreateCustomerOrderRequestDto } from '../../../../../../domain/orders/dtos/request/create-customer-order.request.dto';

@Component({
	selector: 'app-agregar-order-form',
	standalone: false,
	templateUrl: './agregar-order-form.html',
	styleUrl: './agregar-order-form.scss'
})
export class AgregarOrderFormComponent {
	@Input() mostrar = false;
	@Input() productosOptions: Array<{ value: any, label: string }> = [];
	@Output() cerrar = new EventEmitter<void>();
	@Output() pedidoCreado = new EventEmitter<CreateCustomerOrderRequestDto>();

	// Estado de validación
	formSubmitted = false;

	// Datos del formulario
	productoFormulario = {
		idProducto: 0,
		cantidad: 1
	};

	idMesa: number | null = null;
	productosAgregados: Array<{ idProducto: number; cantidad: number }> = [];

	// Columnas para tabla de productos
	columnasProductos = ['idProducto', 'cantidad', 'Acciones'];

	/**
	 * Agrega un producto a la lista
	 */
	onAgregarProducto(): void {
		if (!this.validarProducto()) {
			return;
		}

		const idProducto = this.productoFormulario.idProducto;
		const cantidad = Number(this.productoFormulario.cantidad);
		
		// Verificar si el producto ya existe
		const productoExistente = this.productosAgregados.find(
			p => p.idProducto === idProducto
		);

		if (productoExistente) {
			// Si existe, incrementar la cantidad
			productoExistente.cantidad += cantidad;
		} else {
			// Si no existe, agregarlo a la lista
			this.productosAgregados.push({
				idProducto,
				cantidad
			});
		}

		this.resetProductoFormulario();
	}

	/**
	 * Elimina un producto de la lista
	 */
	onEliminarProducto(idProducto: number): void {
		this.productosAgregados = this.productosAgregados.filter(
			p => p.idProducto !== idProducto
		);
	}

	/**
	 * Guarda el pedido con todos los productos
	 */
	onGuardar(): void {
		this.formSubmitted = true;

		if (this.productosAgregados.length === 0) {
			return;
		}

		const dto: CreateCustomerOrderRequestDto = {
			productos: this.productosAgregados.map(p => ({
				idProducto: Number(p.idProducto),
				cantidad: Number(p.cantidad)
			})),
			idMesa: this.idMesa ? Number(this.idMesa) : undefined
		};

		this.pedidoCreado.emit(dto);
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
	 * Valida los datos del producto
	 */
	private validarProducto(): boolean {
		if (!this.productoFormulario.idProducto || this.productoFormulario.idProducto <= 0) {
			return false;
		}

		if (this.productoFormulario.cantidad <= 0) {
			return false;
		}

		return true;
	}

	/**
	 * Valida que haya al menos un producto
	 */
	private validarFormulario(): boolean {
		return this.productosAgregados.length > 0;
	}

	/**
	 * Reinicia el formulario de producto
	 */
	private resetProductoFormulario(): void {
		this.productoFormulario = {
			idProducto: 0,
			cantidad: 1
		};
	}

	/**
	 * Reinicia el formulario completo
	 */
	private resetForm(): void {
		this.formSubmitted = false;
		this.productosAgregados = [];
		this.idMesa = null;
		this.resetProductoFormulario();
	}
}
