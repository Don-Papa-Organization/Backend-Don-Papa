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
		return this.ordersApi.listAllOrders().pipe(
			map(response => {
				let pedidos = response.data || [];
				if (filtros) {
					if (filtros.busqueda) {
						const term = filtros.busqueda.toLowerCase();
						pedidos = pedidos.filter(p =>
							p.idPedido.toString().includes(term) ||
							p.idUsuario.toString().includes(term) ||
							p.direccionEntrega?.toLowerCase().includes(term)
						);
					}
					if (filtros.estado) {
						pedidos = pedidos.filter(p => p.estado === filtros.estado);
					}
					if (filtros.fechaInicio) {
						const fInicio = new Date(filtros.fechaInicio);
						pedidos = pedidos.filter(p => new Date(p.fechaPedido) >= fInicio);
					}
					if (filtros.fechaFin) {
						const fFin = new Date(filtros.fechaFin);
						pedidos = pedidos.filter(p => new Date(p.fechaPedido) <= fFin);
					}
				}
				return { ...response, data: pedidos };
			})
		);
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
		return {
			"ID": pedido.idPedido,
			"Usuario": `Usuario #${pedido.idUsuario}`,
			"Total": `$${pedido.total}`,
			"Estado": pedido.estado,
			"Canal Venta": pedido.canalVenta,
			"Fecha": this.formatDate(pedido.fechaPedido),
			"Productos": pedido.productos?.length ?? 0,
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
		return {
			"ID Pago": pago.idPago,
			"ID Pedido": pago.idPedido,
			"Monto": `$${pago.monto}`,
			"Fecha": this.formatDate(pago.fechaPago),
			"Método": pago.metodoPago?.nombre || 'N/A',
			// Originales para lógica
			idPago: pago.idPago,
			idPedido: pago.idPedido,
			monto: pago.monto,
			fechaPago: pago.fechaPago
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
		return {
			"ID": pedido.idPedido,
			"Usuario": `Usuario #${pedido.idUsuario}`,
			"Total": `$${pedido.total}`,
			"Estado": pedido.estado,
			"Canal Venta": pedido.canalVenta,
			"Fecha": this.formatDate(pedido.fechaPedido),
			"Dirección": pedido.direccionEntrega || 'N/A',
			// Originales
			idPedido: pedido.idPedido,
			total: pedido.total
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
	fechaPedido: string;
	direccionEntrega: string;
}
