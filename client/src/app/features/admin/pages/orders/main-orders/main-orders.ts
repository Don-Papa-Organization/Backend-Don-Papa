import { Component, OnInit, ViewChild } from '@angular/core';
import { OrdersFacade, OrderViewModel, PaymentMethodViewModel, PaymentViewModel, PendingPaymentOrderViewModel } from '../services/orders.facade';
import { Pedido, EstadoPedido } from '../../../../../domain/orders/models/pedido.model';
import { CreateCustomerOrderRequestDto } from '../../../../../domain/orders/dtos/request/create-customer-order.request.dto';
import { UpdateOrderStatusRequestDto } from '../../../../../domain/orders/dtos/request/update-order-status.request.dto';
import { InventoryFacade } from '../../inventory/services/inventory.facade';
import type { TabItem } from '../../../../../shared/ui/ui-tabs/ui-tabs';
import { AdminFiltros, FiltroOpcion } from '../../../../../shared/ui/ui-admin-filter-panel/ui-admin-filter-panel';
import { AccionTabla } from '../../../../../shared/ui/ui-tabla/ui-tabla';
import { PaymentsSectionComponent } from '../components/payments-section/payments-section';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
	selector: 'app-main-orders',
	standalone: false,
	templateUrl: './main-orders.html',
	styleUrl: './main-orders.scss'
})
export class MainOrdersComponent implements OnInit {
	// Tabs principales
	tabs: TabItem[] = [
		{ id: 'pedidos', label: 'Pedidos' },
		{ id: 'pagos', label: 'Pagos' }
	];

	tabActiva: string = 'pedidos';

	// Estado de datos
	pedidos: OrderViewModel[] = [];
	pedidoSeleccionado: Pedido | null = null;

	pagosPendientes: PendingPaymentOrderViewModel[] = [];
	metodosPago: PaymentMethodViewModel[] = [];
	pagosTodos: PaymentViewModel[] = [];

	// Estados de modales
	mostrarModalAgregar = false;
	mostrarModalEditar = false;
	mostrarModalEliminar = false;
	mostrarModalProductos = false;

	cargandoPedidos = false;
	cargandoPagos = false;

	// Filtros
	filtrosActuales: AdminFiltros | null = null;
	estadoPedidoOpciones: FiltroOpcion[] = [
		{ value: EstadoPedido.PENDIENTE, label: 'Pendiente' },
		{ value: EstadoPedido.ENTREGADO, label: 'Entregado' },
		{ value: EstadoPedido.CANCELADO, label: 'Cancelado' },
		{ value: EstadoPedido.SIN_CONFIRMAR, label: 'Sin Confirmar' }
	];

	// Columnas de tabla
	columnasTabla = ['ID', 'Usuario', 'Total', 'Estado', 'Canal Venta', 'Fecha', 'Productos', 'Dirección', 'Acciones'];

	// Acciones de tabla para pedidos
	accionesPedidos: AccionTabla[] = [
		{
			urlIcono: 'icons/editar.svg',
			accion: (registro: OrderViewModel) => this.onEditar(registro)
		},
		{
			urlIcono: 'icons/product.svg',
			accion: (registro: OrderViewModel) => this.onGestionarProductos(registro)
		},
		{
			urlIcono: 'icons/eliminar.svg',
			accion: (registro: OrderViewModel) => this.onEliminar(registro)
		}
	];

	// Estados disponibles para actualización
	estadosDisponibles = [
		{ valor: EstadoPedido.PENDIENTE, etiqueta: 'Pendiente' },
		{ valor: EstadoPedido.ENTREGADO, etiqueta: 'Entregado' },
		{ valor: EstadoPedido.CANCELADO, etiqueta: 'Cancelado' },
		{ valor: EstadoPedido.SIN_CONFIRMAR, etiqueta: 'Sin Confirmar' }
	];

	// Opciones para combobox de productos
	productosOptions: Array<{ value: any, label: string, stockActual?: number }> = [];

	// Opciones para combobox de métodos de pago
	metodosPagoOptions: Array<{ value: any, label: string }> = [];

	@ViewChild(PaymentsSectionComponent) paymentsSection!: PaymentsSectionComponent;

	constructor(
		private ordersFacade: OrdersFacade,
		private inventoryFacade: InventoryFacade
	) { }

	ngOnInit(): void {
		this.cargarPedidos();
		this.cargarProductos();
		this.cargarSeccionPagos();
	}

	cambiarTab(tabId: string): void {
		this.tabActiva = tabId;

		if (this.tabActiva === 'pagos') {
			this.cargarSeccionPagos();
		}
	}

	onRecargar(): void {
		if (this.tabActiva === 'pagos') {
			this.cargarSeccionPagos();
			return;
		}

		this.cargarPedidos();
	}

	/**
	 * Carga la lista de todos los pedidos
	 */
	cargarPedidos(): void {
		this.cargandoPedidos = true;
		this.ordersFacade.listAllOrders(this.filtrosActuales || undefined).subscribe({
			next: (response: any) => {
				const pedidosData: Pedido[] = response.data || [];

				if (pedidosData.length) {
					this.pedidos = pedidosData.map((pedido: Pedido) =>
						this.ordersFacade.mapOrderToViewModel(pedido)
					);

					const todosEnCero = this.pedidos.every((pedido: any) => Number(pedido['Productos'] ?? 0) === 0);
					if (todosEnCero) {
						this.hidratarCantidadProductos(pedidosData);
					}
				} else {
					this.pedidos = [];
				}
				this.cargandoPedidos = false;
			},
			error: (err) => {
				console.error('Error al cargar pedidos:', err);
				this.cargandoPedidos = false;
			}
		});
	}

	private hidratarCantidadProductos(pedidosBase: Pedido[]): void {
		const solicitudes = pedidosBase.map((pedido) =>
			this.ordersFacade.getOrderById(pedido.idPedido).pipe(
				map((detalle: any) => {
					const productos = detalle?.data?.productos ?? detalle?.data?.pedido?.productos ?? [];
					return {
						idPedido: pedido.idPedido,
						cantidad: Array.isArray(productos) ? productos.length : 0
					};
				}),
				catchError(() => of({ idPedido: pedido.idPedido, cantidad: 0 }))
			)
		);

		forkJoin(solicitudes).subscribe({
			next: (resultados) => {
				const cantidadesPorPedido = new Map<number, number>(
					resultados.map((item) => [item.idPedido, item.cantidad])
				);

				this.pedidos = this.pedidos.map((pedido: any) => ({
					...pedido,
					'Productos': cantidadesPorPedido.get(pedido.idPedido) ?? pedido['Productos']
				}));
			},
			error: (err) => {
				console.error('Error al hidratar cantidad de productos por pedido:', err);
			}
		});
	}

	/**
	 * Carga la lista de productos disponibles para el combobox
	 */
	private cargarProductos(): void {
		this.inventoryFacade.getProductsWithCategories().subscribe({
			next: (productos) => {
				console.log('Productos recibidos:', productos);
				this.productosOptions = productos
					.filter((p: any) => p.activo !== false && p.activo !== 0) // Excluir solo explícitamente inactivos
					.map((producto: any) => {
						const tienePromocion = producto.promotion && producto.promotion !== null;
						const indicadorPromo = tienePromocion ? ' 🏷️ (Promo Activa)' : '';
						const indicadorStock = Number(producto.stockActual) <= 0 ? ' (Sin stock)' : ` (Stock: ${producto.stockActual})`;

						return {
							value: producto.idProducto,
							label: `${producto.nombre} - $${producto.precio}${indicadorPromo}${indicadorStock}`,
							stockActual: Number(producto.stockActual ?? 0)
						};
					});
				console.log('Opciones mapeadas:', this.productosOptions);
			},
			error: (error) => {
				console.error('Error al cargar productos:', error);
			}
		});
	}

	/**
	 * Abre modal para crear nuevo pedido
	 */
	onAgregar(): void {
		this.pedidoSeleccionado = null;
		this.mostrarModalAgregar = true;
	}

	/**
	 * Abre modal para editar pedido
	 */
	onEditar(registro: OrderViewModel): void {
		this.cargandoPedidos = true;
		this.ordersFacade.getOrderById(registro.idPedido).subscribe({
			next: (response: any) => {
				const pedido = response?.data?.pedido;
				const productos = response?.data?.productos ?? [];
				this.pedidoSeleccionado = {
					...pedido,
					productos
				};
				this.mostrarModalEditar = true;
				this.cargandoPedidos = false;
			},
			error: (err) => {
				console.error('Error al cargar pedido:', err);
				this.cargandoPedidos = false;
			}
		});
	}

	/**
	 * Abre modal de confirmación para eliminar
	 */
	onEliminar(registro: OrderViewModel): void {
		this.pedidoSeleccionado = { idPedido: registro.idPedido } as Pedido;
		this.mostrarModalEliminar = true;
	}

	/**
	 * Abre modal para gestionar productos en pedido
	 */
	onGestionarProductos(registro: OrderViewModel): void {
		this.cargandoPedidos = true;
		this.ordersFacade.getOrderById(registro.idPedido).subscribe({
			next: (response: any) => {
				const pedido = response?.data?.pedido;
				const productos = response?.data?.productos ?? [];
				this.pedidoSeleccionado = {
					...pedido,
					productos
				};
				this.mostrarModalProductos = true;
				this.cargandoPedidos = false;
			},
			error: (err) => {
				console.error('Error al cargar pedido:', err);
				this.cargandoPedidos = false;
			}
		});
	}

	/**
	 * Callback cuando se crea un nuevo pedido
	 */
	onPedidoCreado(dto: CreateCustomerOrderRequestDto): void {
		this.cargandoPedidos = true;
		this.ordersFacade.createCustomerOrder(dto).subscribe({
			next: () => {
				this.mostrarModalAgregar = false;
				this.cargarPedidos();
				this.cargandoPedidos = false;
			},
			error: (err) => {
				console.error('Error al crear pedido:', err);
				this.cargandoPedidos = false;
			}
		});
	}

	/**
	 * Callback cuando se actualiza un pedido
	 */
	onPedidoActualizado(dto: UpdateOrderStatusRequestDto): void {
		if (!this.pedidoSeleccionado) return;
		this.cargandoPedidos = true;
		this.ordersFacade.updateOrderStatus(this.pedidoSeleccionado.idPedido, dto.nuevoEstado as EstadoPedido).subscribe({
			next: () => {
				this.mostrarModalEditar = false;
				this.cargarPedidos();
				this.cargandoPedidos = false;
			},
			error: (err) => {
				console.error('Error al actualizar pedido:', err);
				this.cargandoPedidos = false;
			}
		});
	}

	onProductosActualizados(event: { idPedido: number; productos: any[]; cantidadProductos: number }): void {
		if (this.pedidoSeleccionado?.idPedido === event.idPedido) {
			this.pedidoSeleccionado = {
				...this.pedidoSeleccionado,
				productos: event.productos
			};
		}

		this.pedidos = this.pedidos.map((pedido: any) => {
			if (pedido.idPedido !== event.idPedido) {
				return pedido;
			}

			return {
				...pedido,
				'Productos': event.cantidadProductos
			};
		});
	}

	/**
	 * Elimina un pedido
	 */
	confirmarEliminacionPedido(): void {
		if (!this.pedidoSeleccionado) return;

		this.cargandoPedidos = true;
		this.ordersFacade.deleteOrder(this.pedidoSeleccionado.idPedido).subscribe({
			next: () => {
				this.mostrarModalEliminar = false;
				this.cargarPedidos();
				this.cargandoPedidos = false;
			},
			error: (err) => {
				console.error('Error al eliminar pedido:', err);
				this.cargandoPedidos = false;
			}
		});
	}

	/**
	 * Carga toda la sección de pagos
	 */
	cargarSeccionPagos(): void {
		this.cargandoPagos = true;
		let pendientes = 3;
		const finalizar = () => {
			pendientes -= 1;
			if (pendientes <= 0) {
				this.cargandoPagos = false;
			}
		};

		this.cargarPagosPendientes(finalizar);
		this.cargarMetodosPago(finalizar);
		this.cargarTodosPagos(finalizar);
	}

	private cargarPagosPendientes(finalizar?: () => void): void {
		this.ordersFacade.listPendingPaymentOrders().subscribe({
			next: (response: any) => {
				this.pagosPendientes = (response.data ?? []).map((pedido: any) =>
					this.ordersFacade.mapPendingPaymentOrderToViewModel(pedido)
				);
				finalizar?.();
			},
			error: (err) => {
				console.error('Error al cargar pagos pendientes:', err);
				finalizar?.();
			}
		});
	}

	private cargarMetodosPago(finalizar?: () => void): void {
		this.ordersFacade.listPaymentMethods().subscribe({
			next: (response: any) => {
				this.metodosPago = (response.data ?? []).map((metodo: any) =>
					this.ordersFacade.mapPaymentMethodToViewModel(metodo)
				);
				this.metodosPagoOptions = this.metodosPago.map((metodo) => ({
					value: metodo.idMetodoPago,
					label: metodo.nombre
				}));
				finalizar?.();
			},
			error: (err) => {
				console.error('Error al cargar métodos de pago:', err);
				finalizar?.();
			}
		});
	}

	private cargarTodosPagos(finalizar?: () => void): void {
		this.ordersFacade.listAllPayments().subscribe({
			next: (response: any) => {
				this.pagosTodos = (response.data ?? []).map((pago: any) =>
					this.ordersFacade.mapPaymentToViewModel(pago)
				);
				finalizar?.();
			},
			error: (err) => {
				const status = err?.status;
				if (status === 401 || status === 403) {
					this.ordersFacade.getPaymentHistory().subscribe({
						next: (response: any) => {
							this.pagosTodos = (response.data ?? []).map((pago: any) =>
								this.ordersFacade.mapPaymentToViewModel(pago)
							);
							finalizar?.();
						},
						error: (historyErr) => {
							console.error('Error al cargar historial de pagos:', historyErr);
							finalizar?.();
						}
					});
					return;
				}

				console.error('Error al cargar todos los pagos:', err);
				finalizar?.();
			}
		});
	}

	/**
	 * Abre el modal de métodos de pago en payments-section
	 */
	onAbrirModalMetodosPago(): void {
		if (this.paymentsSection) {
			this.paymentsSection.onAbrirModalMetodosPago();
		}
	}

	/**
	 * Abre el modal para agregar método de pago en payments-section
	 */
	onAgregarMetodoPago(): void {
		if (this.paymentsSection) {
			this.paymentsSection.onAgregarMetodoPago();
		}
	}

	/**
	 * Cierra modal de agregar
	 */
	cerrarModalAgregar(): void {
		this.mostrarModalAgregar = false;
	}

	/**
	 * Cierra modal de editar
	 */
	cerrarModalEditar(): void {
		this.mostrarModalEditar = false;
	}

	/**
	 * Cierra modal de eliminar
	 */
	cerrarModalEliminar(): void {
		this.mostrarModalEliminar = false;
	}

	/**
	 * Cierra modal de productos
	 */
	cerrarModalProductos(): void {
		this.mostrarModalProductos = false;
	}

	// ==================== FILTROS ====================

	onFiltrosAplicados(filtros: AdminFiltros): void {
		this.filtrosActuales = filtros;
		this.onRecargar();
	}

	onFiltrosLimpiados(): void {
		this.filtrosActuales = null;
		this.onRecargar();
	}
}
