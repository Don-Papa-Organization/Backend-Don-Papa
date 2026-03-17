import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Pedido, ProductoPedidoItem } from '../../../../../../domain/orders/models/pedido.model';
import { OrdersFacade } from '../../services/orders.facade';
import { AddProductToOrderRequestDto } from '../../../../../../domain/orders/dtos/request/add-product-to-order.request.dto';
import { AccionTabla } from '../../../../../../shared/ui/ui-tabla/ui-tabla';

interface PedidoProductosActualizadosEvent {
	idPedido: number;
	productos: ProductoPedidoItem[];
	cantidadProductos: number;
}

@Component({
	selector: 'app-gestionar-productos-form',
	standalone: false,
	templateUrl: './gestionar-productos-form.html',
	styleUrl: './gestionar-productos-form.scss'
})
export class GestionarProductosFormComponent implements OnChanges {
	@Input() mostrar = false;
	@Input() pedidoSeleccionado: Pedido | null = null;
	@Input() productosOptions: Array<{ value: any, label: string, stockActual?: number }> = [];
	@Output() cerrar = new EventEmitter<void>();
	@Output() pedidoActualizado = new EventEmitter<PedidoProductosActualizadosEvent>();

	// Estado
	productos: ProductoPedidoItem[] = [];
	cargando = false;
	mensajeValidacionProducto: string | null = null;
	mostrarModalAgregarProducto = false;

	// Nuevo producto a agregar
	nuevoProducto = {
		idProducto: null as number | null,
		cantidad: 1
	};

	// Producto seleccionado para eliminar
	productoAEliminar: ProductoPedidoItem | null = null;
	mostrarModalEliminar = false;

	columnasTabla = ['idProductoPedido', 'idProducto', 'cantidad', 'precioUnitario', 'subtotal', 'Acciones'];

	accionesProductosPedido: AccionTabla[] = [
		{
			urlIcono: 'icons/eliminar.svg',
			accion: (registro: ProductoPedidoItem) => this.onEliminarProducto(registro)
		}
	];

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

	private recargarProductosPedido(): void {
		if (!this.pedidoSeleccionado) {
			this.cargando = false;
			return;
		}

		this.ordersFacade.getOrderById(this.pedidoSeleccionado.idPedido).subscribe({
			next: (response: any) => {
				const pedido = response?.data?.pedido;
				const productos = response?.data?.productos ?? [];
				const idPedido = pedido?.idPedido ?? this.pedidoSeleccionado?.idPedido;

				this.productos = productos;
				this.pedidoSeleccionado = {
					...pedido,
					productos
				};

				if (idPedido) {
					this.pedidoActualizado.emit({
						idPedido,
						productos,
						cantidadProductos: productos.length
					});
				}
				this.mostrarModalAgregarProducto = false;
				this.cargando = false;
			},
			error: (err) => {
				console.error('Error al recargar productos del pedido:', err);
				this.cargando = false;
			}
		});
	}

	abrirModalAgregarProducto(): void {
		this.mensajeValidacionProducto = null;
		this.mostrarModalAgregarProducto = true;
	}

	cerrarModalAgregarProducto(): void {
		this.resetProductoForm();
		this.mostrarModalAgregarProducto = false;
	}

	/**
	 * Agrega un producto al pedido
	 */
	onAgregarProducto(): void {
		this.mensajeValidacionProducto = null;

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
				this.recargarProductosPedido();
			},
			error: (err) => {
				console.error('Error al agregar producto:', err);
				this.mensajeValidacionProducto = err?.error?.message || 'No se pudo agregar el producto al pedido.';
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
					this.productoAEliminar = null;
					this.recargarProductosPedido();
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
		this.mostrarModalAgregarProducto = false;
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
			this.mensajeValidacionProducto = 'Debe seleccionar un producto.';
			return false;
		}

		if (this.nuevoProducto.cantidad <= 0) {
			this.mensajeValidacionProducto = 'La cantidad debe ser mayor a 0.';
			return false;
		}

		const stockDisponible = this.getStockDisponible(this.nuevoProducto.idProducto);
		const cantidadActualEnPedido = this.getCantidadActualEnPedido(this.nuevoProducto.idProducto);
		const cantidadTotalSolicitada = cantidadActualEnPedido + this.nuevoProducto.cantidad;

		if (stockDisponible !== null && cantidadTotalSolicitada > stockDisponible) {
			this.mensajeValidacionProducto = `La cantidad total (${cantidadTotalSolicitada}) excede el stock disponible (${stockDisponible}) para este producto.`;
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

	private getCantidadActualEnPedido(idProducto: number): number {
		const productoEnPedido = this.productos.find(p => Number(p.idProducto) === Number(idProducto));
		return productoEnPedido ? Number(productoEnPedido.cantidad) : 0;
	}

	/**
	 * Reinicia el formulario de producto
	 */
	private resetProductoForm(): void {
		this.mensajeValidacionProducto = null;
		this.nuevoProducto = {
			idProducto: null,
			cantidad: 1
		};
	}
}
