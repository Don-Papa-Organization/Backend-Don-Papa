import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrdersApi } from '../../../../../services/apis/orders.api';
import { Pedido, ProductoPedidoItem, EstadoPedido } from '../../../../../domain/orders/models/pedido.model';
import { MetodoPago, Pago } from '../../../../../domain/orders/models/pago.model';
import { CreateCustomerOrderRequestDto } from '../../../../../domain/orders/dtos/request/create-customer-order.request.dto';
import { UpdateOrderStatusRequestDto } from '../../../../../domain/orders/dtos/request/update-order-status.request.dto';
import { CreatePaymentMethodRequestDto } from '../../../../../domain/orders/dtos/request/create-payment-method.request.dto';
import { UpdatePaymentMethodRequestDto } from '../../../../../domain/orders/dtos/request/update-payment-method.request.dto';
import { RegisterPaymentRequestDto } from '../../../../../domain/orders/dtos/request/register-payment.request.dto';
import { ListAllOrdersRequestDto } from '../../../../../domain/orders/dtos/request/list-all-orders.request.dto';
import { UpdateOrderProductQuantityRequestDto } from '../../../../../domain/orders/dtos/request/update-order-product-quantity.request.dto';
import { ListAllPaymentsRequestDto } from '../../../../../domain/orders/dtos/request/list-all-payments.request.dto';
import { PaymentHistoryRequestDto } from '../../../../../domain/orders/dtos/request/payment-history.request.dto';
import { ApiResponse } from '../../../../../types/api-response.type';
import { AddProductToOrderRequestDto } from '../../../../../domain/orders/dtos/request/add-product-to-order.request.dto';
import { PendingPaymentOrderDto } from '../../../../../domain/orders/dtos/response/list-pending-payment-orders.response.dto';
import { map } from 'rxjs/operators';
import { AdminFiltros } from '../../../../../shared/ui/ui-admin-filter-panel/ui-admin-filter-panel';

/**
 * OrdersFacade
 * Orquestador de operaciones de negocio para administración de pedidos
 * Responsabilidades:
 * - Listar todos los pedidos
 * - Crear pedidos para clientes
 * - Actualizar estado de pedidos
 * - Agregar/eliminar productos en pedidos
 * - Gestionar métodos de pago
 * - Registrar pagos
 * - Obtener historial de pagos
 */
@Injectable({ providedIn: 'root' })
export class OrdersFacade {
	constructor(private ordersApi: OrdersApi) { }

	/**
	 * Obtiene todos los pedidos con filtros opcionales
	 */
	listAllOrders(filtros?: AdminFiltros): Observable<ApiResponse<Pedido[]> & { pagination: any }> {
		const dto: ListAllOrdersRequestDto | undefined = filtros
			? {
				page: 1,
				limit: 200,
				busqueda: filtros.busqueda || undefined,
				estado: filtros.estado || undefined,
				fechaInicio: filtros.fechaInicio || undefined,
				fechaFin: filtros.fechaFin || undefined
			}
			: undefined;

		return this.ordersApi.listAllOrders(dto);
	}

	listAllOrdersFiltered(filtros?: AdminFiltros): Observable<ApiResponse<Pedido[]> & { pagination: any }> {
		return this.listAllOrders(filtros);
	}

	/**
	 * Obtiene un pedido específico por ID
	 */
	getOrderById(idPedido: number): Observable<ApiResponse<{ pedido: Pedido; productos: ProductoPedidoItem[] }>> {
		return this.ordersApi.getOrderById(idPedido);
	}

	/**
	 * Crea un nuevo pedido para un cliente
	 */
	createCustomerOrder(dto: CreateCustomerOrderRequestDto): Observable<ApiResponse<any>> {
		return this.ordersApi.createCustomerOrder(dto);
	}

	/**
	 * Actualiza el estado de un pedido
	 */
	updateOrderStatus(idPedido: number, nuevoEstado: EstadoPedido): Observable<ApiResponse<any>> {
		const dto: UpdateOrderStatusRequestDto = { nuevoEstado };
		return this.ordersApi.updateOrderStatus(idPedido, dto);
	}

	/**
	 * Agrega un producto a un pedido existente
	 */
	addProductToOrder(idPedido: number, dto: AddProductToOrderRequestDto): Observable<ApiResponse<any>> {
		return this.ordersApi.addProductToOrder(idPedido, dto);
	}

	/**
	 * Elimina un producto de un pedido
	 */
	removeProductFromOrder(idPedido: number, idProductoPedido: number): Observable<ApiResponse<null>> {
		return this.ordersApi.removeProductFromOrder(idPedido, idProductoPedido);
	}

	updateOrderProductQuantity(
		idPedido: number,
		idProductoPedido: number,
		cantidadOrDto: number | UpdateOrderProductQuantityRequestDto
	): Observable<ApiResponse<any>> {
		const dto: UpdateOrderProductQuantityRequestDto = typeof cantidadOrDto === 'number'
			? { cantidad: cantidadOrDto }
			: cantidadOrDto;

		return this.ordersApi.updateOrderProductQuantity(idPedido, idProductoPedido, dto);
	}

	/**
	 * Elimina un pedido completamente
	 */
	deleteOrder(idPedido: number): Observable<ApiResponse<null>> {
		return this.ordersApi.deleteOrder(idPedido);
	}

	/**
	 * Obtiene las órdenes pendientes de pago
	 */
	listPendingPaymentOrders(): Observable<ApiResponse<any[]> & { pagination: any }> {
		return this.ordersApi.listPendingPaymentOrders();
	}

	/**
	 * Obtiene todos los métodos de pago disponibles
	 */
	listPaymentMethods(): Observable<ApiResponse<MetodoPago[]>> {
		return this.ordersApi.listPaymentMethods();
	}

	/**
	 * Crea un nuevo método de pago
	 */
	createPaymentMethod(dto: CreatePaymentMethodRequestDto): Observable<ApiResponse<MetodoPago>> {
		return this.ordersApi.createPaymentMethod(dto);
	}

	/**
	 * Actualiza un método de pago existente
	 */
	updatePaymentMethod(idMetodo: number, dto: UpdatePaymentMethodRequestDto): Observable<ApiResponse<MetodoPago>> {
		return this.ordersApi.updatePaymentMethod(idMetodo, dto);
	}

	/**
	 * Elimina un método de pago
	 */
	deletePaymentMethod(idMetodo: number): Observable<ApiResponse<null>> {
		return this.ordersApi.deletePaymentMethod(idMetodo);
	}

	/**
	 * Registra un pago para un pedido
	 */
	registerPayment(idPedido: number, dto: RegisterPaymentRequestDto): Observable<ApiResponse<any>> {
		return this.ordersApi.registerPayment(idPedido, dto);
	}

	/**
	 * Obtiene el historial de pagos
	 */
	getPaymentHistory(filters?: PaymentHistoryRequestDto): Observable<ApiResponse<Pago[]> & { pagination: any }> {
		return this.ordersApi.getPaymentHistory(filters);
	}

	/**
	 * Obtiene todos los pagos
	 */
	listAllPayments(filters?: ListAllPaymentsRequestDto): Observable<ApiResponse<Pago[]> & { pagination: any }> {
		return this.ordersApi.listAllPayments(filters);
	}

	/**
	 * Descarga recibo de un pago
	 */
	downloadReceipt(idPago: number): Observable<ArrayBuffer> {
		return this.ordersApi.downloadReceipt(idPago);
	}

	/**
	 * Mapea un pedido a ViewModel para presentación en tabla
	 */
	mapOrderToViewModel(pedido: Pedido): any {
		const pedidoExt = pedido as Pedido & {
			cantidadProductos?: number;
			totalProductos?: number;
			productosCount?: number;
		};

		const cantidadProductos =
			pedido.productos?.length ??
			pedidoExt.cantidadProductos ??
			pedidoExt.totalProductos ??
			pedidoExt.productosCount ??
			0;

		return {
			"ID": pedido.idPedido,
			"Usuario": `Usuario #${pedido.idUsuario}`,
			"Total": `$${pedido.total}`,
			"Estado": pedido.estado,
			"Canal Venta": pedido.canalVenta,
			"Fecha": this.formatDate(pedido.fechaPedido),
			"Productos": cantidadProductos,
			"Dirección": pedido.direccionEntrega || 'N/A',
			// Originales para lógica
			idPedido: pedido.idPedido,
			idUsuario: pedido.idUsuario,
			total: pedido.total,
			estado: pedido.estado,
			fechaPedido: pedido.fechaPedido
		};
	}

	/**
	 * Mapea un pago a ViewModel para presentación en tabla
	 */
	mapPaymentToViewModel(pago: Pago): any {
		const metodoTexto = pago.detalles?.length
			? pago.detalles.map(d => `${d.nombre || `Método #${d.idMetodoPago}`}: $${Number(d.monto).toFixed(2)}`).join(' | ')
			: (pago.metodoPago?.nombre || 'N/A');

		return {
			"ID Pago": pago.idPago,
			"ID Pedido": pago.idPedido,
			"Monto": `$${pago.monto}`,
			"Fecha": this.formatDate(pago.fechaPago),
			"Método": metodoTexto,
			// Originales para lógica
			idPago: pago.idPago,
			idPedido: pago.idPedido,
			monto: pago.monto,
			fechaPago: pago.fechaPago,
			detalles: pago.detalles || []
		};
	}

	/**
	 * Mapea un método de pago a ViewModel
	 */
	mapPaymentMethodToViewModel(metodo: MetodoPago): PaymentMethodViewModel {
		return {
			idMetodoPago: metodo.idMetodoPago,
			nombre: metodo.nombre,
			"ID": metodo.idMetodoPago,
			"Nombre": metodo.nombre
		};
	}

	/**
	 * Mapea una orden pendiente de pago a ViewModel
	 */
	mapPendingPaymentOrderToViewModel(pedido: PendingPaymentOrderDto): any {
		const atencion = pedido.canalVenta === 'fisico' ? (pedido.tipoAtencion || 'N/A') : 'N/A';

		return {
			"ID": pedido.idPedido,
			"Usuario": `Usuario #${pedido.idUsuario}`,
			"Total": `$${pedido.total}`,
			"Estado": pedido.estado,
			"Canal Venta": pedido.canalVenta,
			"Atención": atencion,
			"Fecha": this.formatDate(pedido.fechaPedido),
			"Dirección": pedido.direccionEntrega || 'N/A',
			// Originales
			idPedido: pedido.idPedido,
			total: pedido.total,
			tipoAtencion: pedido.tipoAtencion
		};
	}

	private formatDate(dateString: string): string {
		try {
			if (!dateString) return 'N/A';
			const date = new Date(dateString);
			if (isNaN(date.getTime())) return dateString;

			return date.toLocaleString('es-ES', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return dateString;
		}
	}
}

/**
 * ViewModel para visualización de órdenes en tabla
 */
export interface OrderViewModel {
	idPedido: number;
	idUsuario: number;
	total: number;
	estado: string;
	canalVenta: string;
	fechaPedido: string;
	cantidadProductos: number;
	direccionEntrega: string;
}

/**
 * ViewModel para visualización de pagos en tabla
 */
export interface PaymentViewModel {
	idPago: number;
	idPedido: number;
	monto: number;
	fechaPago: string;
	metodoPago: string;
	detalles?: Array<{ idMetodoPago: number; nombre?: string; monto: number }>;
}

/**
 * ViewModel para visualización de métodos de pago
 */
export interface PaymentMethodViewModel {
	idMetodoPago: number;
	nombre: string;
	"ID"?: number;
	"Nombre"?: string;
}

/**
 * ViewModel para órdenes pendientes de pago
 */
export interface PendingPaymentOrderViewModel {
	idPedido: number;
	idUsuario: number;
	total: number;
	estado: string;
	canalVenta: string;
	tipoAtencion?: 'local' | 'llevar';
	fechaPedido: string;
	direccionEntrega: string;
}
