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
	@Input() productosOptions: Array<{ value: any, label: string, stockActual?: number }> = [];
	@Output() cerrar = new EventEmitter<void>();
	@Output() pedidoCreado = new EventEmitter<CreateCustomerOrderRequestDto>();

	// Estado de validación
	formSubmitted = false;
	mensajeValidacionProducto: string | null = null;

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
		this.formSubmitted = true;
		this.mensajeValidacionProducto = null;

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
			const nuevaCantidad = productoExistente.cantidad + cantidad;
			const stockDisponible = this.getStockDisponible(idProducto);

			if (stockDisponible !== null && nuevaCantidad > stockDisponible) {
				this.mensajeValidacionProducto = `La cantidad total (${nuevaCantidad}) excede el stock disponible (${stockDisponible}) para este producto.`;
				return;
			}

			productoExistente.cantidad = nuevaCantidad;
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
		this.mensajeValidacionProducto = null;

		if (this.productosAgregados.length === 0) {
			return;
		}

		for (const producto of this.productosAgregados) {
			const stockDisponible = this.getStockDisponible(producto.idProducto);
			if (stockDisponible !== null && producto.cantidad > stockDisponible) {
				this.mensajeValidacionProducto = `El producto ${producto.idProducto} excede el stock disponible (${stockDisponible}).`;
				return;
			}
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
			this.mensajeValidacionProducto = 'Debe seleccionar un producto.';
			return false;
		}

		if (this.productoFormulario.cantidad <= 0) {
			this.mensajeValidacionProducto = 'La cantidad debe ser mayor a 0.';
			return false;
		}

		const stockDisponible = this.getStockDisponible(this.productoFormulario.idProducto);
		if (stockDisponible !== null && this.productoFormulario.cantidad > stockDisponible) {
			this.mensajeValidacionProducto = `La cantidad solicitada (${this.productoFormulario.cantidad}) excede el stock disponible (${stockDisponible}).`;
			return false;
		}

		return true;
	}

	private getStockDisponible(idProducto: number): number | null {
		const producto = this.productosOptions.find(p => Number(p.value) === Number(idProducto));
		if (!producto || producto.stockActual === undefined || producto.stockActual === null) {
			return null;
		}

		return Number(producto.stockActual);
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
		this.mensajeValidacionProducto = null;
		this.productosAgregados = [];
		this.idMesa = null;
		this.resetProductoFormulario();
	}
}
