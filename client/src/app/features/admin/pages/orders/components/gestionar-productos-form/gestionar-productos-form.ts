import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Pedido, ProductoPedidoItem } from '../../../../../../domain/orders/models/pedido.model';
import { OrdersFacade } from '../../services/orders.facade';
import { AddProductToOrderRequestDto } from '../../../../../../domain/orders/dtos/request/add-product-to-order.request.dto';

@Component({
	selector: 'app-gestionar-productos-form',
	standalone: false,
	templateUrl: './gestionar-productos-form.html',
	styleUrl: './gestionar-productos-form.scss'
})
export class GestionarProductosFormComponent implements OnChanges {
	@Input() mostrar = false;
	@Input() pedidoSeleccionado: Pedido | null = null;
	@Input() productosOptions: Array<{ value: any, label: string }> = [];
	@Output() cerrar = new EventEmitter<void>();
	@Output() pedidoActualizado = new EventEmitter<void>();

	// Estado
	productos: ProductoPedidoItem[] = [];
	cargando = false;

	// Nuevo producto a agregar
	nuevoProducto = {
		idProducto: null as number | null,
		cantidad: 1
	};

	// Producto seleccionado para eliminar
	productoAEliminar: ProductoPedidoItem | null = null;
	mostrarModalEliminar = false;

	columnasTabla = ['idProductoPedido', 'idProducto', 'cantidad', 'precioUnitario', 'subtotal'];

	constructor(private ordersFacade: OrdersFacade) { }

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['pedidoSeleccionado'] && this.pedidoSeleccionado && this.mostrar) {
			this.cargarProductos();
		}
	}

	/**
	 * Carga los productos del pedido
	 */
	private cargarProductos(): void {
		if (!this.pedidoSeleccionado) return;

		this.productos = this.pedidoSeleccionado.productos || [];
	}

	/**
	 * Agrega un producto al pedido
	 */
	onAgregarProducto(): void {
		if (!this.pedidoSeleccionado || !this.validarProducto()) {
			return;
		}

		this.cargando = true;
		const dto: AddProductToOrderRequestDto = {
			idProducto: this.nuevoProducto.idProducto!,
			cantidad: this.nuevoProducto.cantidad
		};

		this.ordersFacade.addProductToOrder(this.pedidoSeleccionado.idPedido, dto).subscribe({
			next: () => {
				this.resetProductoForm();
				this.pedidoActualizado.emit();
				this.cargando = false;
			},
			error: (err) => {
				console.error('Error al agregar producto:', err);
				this.cargando = false;
			}
		});
	}

	/**
	 * Abre modal de confirmación para eliminar producto
	 */
	onEliminarProducto(producto: ProductoPedidoItem): void {
		this.productoAEliminar = producto;
		this.mostrarModalEliminar = true;
	}

	/**
	 * Confirma la eliminación del producto
	 */
	confirmarEliminacionProducto(): void {
		if (!this.pedidoSeleccionado || !this.productoAEliminar) return;

		this.cargando = true;
		this.ordersFacade
			.removeProductFromOrder(this.pedidoSeleccionado.idPedido, this.productoAEliminar.idProductoPedido)
			.subscribe({
				next: () => {
					this.mostrarModalEliminar = false;
					this.pedidoActualizado.emit();
					this.cargando = false;
				},
				error: (err) => {
					console.error('Error al eliminar producto:', err);
					this.cargando = false;
				}
			});
	}

	/**
	 * Cierra el modal
	 */
	onCerrar(): void {
		this.resetProductoForm();
		this.mostrarModalEliminar = false;
		this.cerrar.emit();
	}

	/**
	 * Cierra modal de eliminación
	 */
	cerrarModalEliminar(): void {
		this.mostrarModalEliminar = false;
	}

	/**
	 * Valida los datos del producto
	 */
	private validarProducto(): boolean {
		if (!this.nuevoProducto.idProducto || this.nuevoProducto.idProducto <= 0) {
			return false;
		}

		if (this.nuevoProducto.cantidad <= 0) {
			return false;
		}

		return true;
	}

	/**
	 * Reinicia el formulario de producto
	 */
	private resetProductoForm(): void {
		this.nuevoProducto = {
			idProducto: null,
			cantidad: 1
		};
	}
}
