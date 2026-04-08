import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiResponse } from "../../types/api-response.type";
import { Pedido, ProductoPedidoItem } from "../../domain/orders/models/pedido.model";
import { Pago, MetodoPago } from "../../domain/orders/models/pago.model";
import { AddProductToCartRequestDto } from "../../domain/orders/dtos/request/add-product-to-cart.request.dto";
import { UpdateCartProductRequestDto } from "../../domain/orders/dtos/request/update-cart-product.request.dto";
import { ConfirmOrderRequestDto } from "../../domain/orders/dtos/request/confirm-order.request.dto";
import { CreateCustomerOrderRequestDto } from "../../domain/orders/dtos/request/create-customer-order.request.dto";
import { AddProductToOrderRequestDto } from "../../domain/orders/dtos/request/add-product-to-order.request.dto";
import { ListOrderHistoryRequestDto } from "../../domain/orders/dtos/request/list-order-history.request.dto";
import { ListOrdersInProgressRequestDto } from "../../domain/orders/dtos/request/list-orders-in-progress.request.dto";
import { ListAllOrdersRequestDto } from "../../domain/orders/dtos/request/list-all-orders.request.dto";
import { UpdateOrderProductQuantityRequestDto } from "../../domain/orders/dtos/request/update-order-product-quantity.request.dto";
import { UpdateOrderStatusRequestDto } from "../../domain/orders/dtos/request/update-order-status.request.dto";
import { RegisterPaymentRequestDto } from "../../domain/orders/dtos/request/register-payment.request.dto";
import { ListPendingPaymentOrdersRequestDto } from "../../domain/orders/dtos/request/list-pending-payment-orders.request.dto";
import { CreatePaymentMethodRequestDto } from "../../domain/orders/dtos/request/create-payment-method.request.dto";
import { UpdatePaymentMethodRequestDto } from "../../domain/orders/dtos/request/update-payment-method.request.dto";
import { PaymentHistoryRequestDto } from "../../domain/orders/dtos/request/payment-history.request.dto";
import { ListAllPaymentsRequestDto } from "../../domain/orders/dtos/request/list-all-payments.request.dto";
import { PaginationMetaDto } from "../../types/pagination-meta.dto";
import { AddProductToCartDataDto } from "../../domain/orders/dtos/response/add-product-to-cart.response.dto";
import { GetCartDataDto } from "../../domain/orders/dtos/response/get-cart.response.dto";
import { UpdateCartProductDataDto } from "../../domain/orders/dtos/response/update-cart-product.response.dto";
import { RemoveCartProductDataDto } from "../../domain/orders/dtos/response/remove-cart-product.response.dto";
import { ClearCartDataDto } from "../../domain/orders/dtos/response/clear-cart.response.dto";
import { ConfirmOrderDataDto } from "../../domain/orders/dtos/response/confirm-order.response.dto";
import { CreateCustomerOrderDataDto } from "../../domain/orders/dtos/response/create-customer-order.response.dto";
import { AddProductToOrderDataDto } from "../../domain/orders/dtos/response/add-product-to-order.response.dto";
import { OrderHistoryItemDto } from "../../domain/orders/dtos/response/list-order-history.response.dto";
import { CustomerOrderDetailDataDto } from "../../domain/orders/dtos/response/get-customer-order-detail.response.dto";
import { GetOpenOrderByMesaDataDto } from "../../domain/orders/dtos/response/get-open-order-by-mesa.response.dto";
import { UpdateOrderStatusDataDto } from "../../domain/orders/dtos/response/update-order-status.response.dto";
import { UpdateOrderProductQuantityDataDto } from "../../domain/orders/dtos/response/update-order-product-quantity.response.dto";
import { PendingPaymentOrderDto } from "../../domain/orders/dtos/response/list-pending-payment-orders.response.dto";
import { RegisterPaymentDataDto } from "../../domain/orders/dtos/response/register-payment.response.dto";
import { MercadoPagoPreferenceDataDto } from "../../domain/orders/dtos/response/mercadopago-preference.response.dto";
import { API_ENDPOINTS, buildApiUrl } from "../../config/api.config";

@Injectable({ providedIn: "root" })
export class OrdersApi {
	constructor(private http: HttpClient) {}

	addProductToCart(dto: AddProductToCartRequestDto): Observable<ApiResponse<AddProductToCartDataDto>> {
		return this.http.post<ApiResponse<AddProductToCartDataDto>>(buildApiUrl(API_ENDPOINTS.orders.cartProduct()), dto);
	}

	removeProductFromCart(idProductoPedido: number): Observable<ApiResponse<RemoveCartProductDataDto>> {
		return this.http.delete<ApiResponse<RemoveCartProductDataDto>>(
			buildApiUrl(API_ENDPOINTS.orders.cartProductDetail(idProductoPedido))
		);
	}

	updateProductQuantity(idProductoPedido: number, dto: UpdateCartProductRequestDto): Observable<ApiResponse<UpdateCartProductDataDto>> {
		return this.http.patch<ApiResponse<UpdateCartProductDataDto>>(
			buildApiUrl(API_ENDPOINTS.orders.cartProductDetail(idProductoPedido)),
			dto
		);
	}

	clearCart(): Observable<ApiResponse<ClearCartDataDto>> {
		return this.http.delete<ApiResponse<ClearCartDataDto>>(buildApiUrl(API_ENDPOINTS.orders.cart()));
	}

	getCart(): Observable<ApiResponse<GetCartDataDto>> {
		return this.http.get<ApiResponse<GetCartDataDto>>(buildApiUrl(API_ENDPOINTS.orders.cart()));
	}

	confirmOrder(dto: ConfirmOrderRequestDto): Observable<ApiResponse<ConfirmOrderDataDto>> {
		return this.http.post<ApiResponse<ConfirmOrderDataDto>>(buildApiUrl(API_ENDPOINTS.orders.confirmOrder()), dto);
	}

	createCustomerOrder(dto: CreateCustomerOrderRequestDto): Observable<ApiResponse<CreateCustomerOrderDataDto>> {
		return this.http.post<ApiResponse<CreateCustomerOrderDataDto>>(
			buildApiUrl(API_ENDPOINTS.orders.createCustomerOrder()),
			dto
		);
	}

	addProductToOrder(idPedido: number, dto: AddProductToOrderRequestDto): Observable<ApiResponse<AddProductToOrderDataDto>> {
		return this.http.post<ApiResponse<AddProductToOrderDataDto>>(
			buildApiUrl(API_ENDPOINTS.orders.orderProduct(idPedido)),
			dto
		);
	}

	removeProductFromOrder(idPedido: number, idProductoPedido: number): Observable<ApiResponse<null>> {
		return this.http.delete<ApiResponse<null>>(
			buildApiUrl(API_ENDPOINTS.orders.orderProductDetail(idPedido, idProductoPedido))
		);
	}

	updateOrderProductQuantity(idPedido: number, idProductoPedido: number, dto: UpdateOrderProductQuantityRequestDto): Observable<ApiResponse<UpdateOrderProductQuantityDataDto>> {
		return this.http.patch<ApiResponse<UpdateOrderProductQuantityDataDto>>(
			buildApiUrl(API_ENDPOINTS.orders.orderProductDetail(idPedido, idProductoPedido)),
			dto
		);
	}

	deleteOrder(idPedido: number): Observable<ApiResponse<null>> {
		return this.http.delete<ApiResponse<null>>(buildApiUrl(API_ENDPOINTS.orders.orderDetail(idPedido)));
	}

	getOrderById(idPedido: number): Observable<ApiResponse<{ pedido: Pedido; productos: ProductoPedidoItem[] }>> {
		return this.http.get<ApiResponse<{ pedido: Pedido; productos: ProductoPedidoItem[] }>>(
			buildApiUrl(API_ENDPOINTS.orders.orderDetail(idPedido))
		);
	}

	getOpenOrderByMesa(idMesa: number): Observable<ApiResponse<GetOpenOrderByMesaDataDto>> {
		return this.http.get<ApiResponse<GetOpenOrderByMesaDataDto>>(
			buildApiUrl(API_ENDPOINTS.orders.orderOpenByMesa(idMesa))
		);
	}

	getProductsPromotionPricing(productIds: number[]): Observable<ApiResponse<{ items: Array<{
		idProducto: number;
		precioOriginal: number;
		precioPromocional: number | null;
		tienePromocion: boolean;
	}> }>> {
		return this.http.post<ApiResponse<{ items: Array<{
			idProducto: number;
			precioOriginal: number;
			precioPromocional: number | null;
			tienePromocion: boolean;
		}> }>>(
			buildApiUrl(API_ENDPOINTS.orders.productsPromotionPricing()),
			{ productIds }
		);
	}

	listOrderHistory(dto?: ListOrderHistoryRequestDto): Observable<ApiResponse<OrderHistoryItemDto[]> & { pagination: PaginationMetaDto }> {
		return this.http.get<ApiResponse<OrderHistoryItemDto[]> & { pagination: PaginationMetaDto }>(
			buildApiUrl(API_ENDPOINTS.orders.orderHistory()),
			{
			params: dto as any
			}
		);
	}

	getCustomerOrderDetail(idPedido: number): Observable<ApiResponse<CustomerOrderDetailDataDto>> {
		return this.http.get<ApiResponse<CustomerOrderDetailDataDto>>(
			buildApiUrl(API_ENDPOINTS.orders.orderCustomerDetail(idPedido))
		);
	}

	downloadReceiptByOrderId(idPedido: number): Observable<ArrayBuffer> {
		return this.http.get(buildApiUrl(API_ENDPOINTS.orders.orderCustomerReceipt(idPedido)), { responseType: "arraybuffer" });
	}

	listOrdersInProgress(dto?: ListOrdersInProgressRequestDto): Observable<ApiResponse<Pedido[]> & { pagination: PaginationMetaDto }> {
		return this.http.get<ApiResponse<Pedido[]> & { pagination: PaginationMetaDto }>(
			buildApiUrl(API_ENDPOINTS.orders.ordersInProgress()),
			{
			params: dto as any
			}
		);
	}

	checkOrderStatus(idPedido: number): Observable<ApiResponse<Pedido>> {
		return this.http.get<ApiResponse<Pedido>>(buildApiUrl(API_ENDPOINTS.orders.orderStatus(idPedido)));
	}

	listAllOrders(dto?: ListAllOrdersRequestDto): Observable<ApiResponse<Pedido[]> & { pagination: PaginationMetaDto }> {
		return this.http.get<ApiResponse<Pedido[]> & { pagination: PaginationMetaDto }>(
			buildApiUrl(API_ENDPOINTS.orders.ordersAll()),
			{
			params: dto as any
			}
		);
	}

	updateOrderStatus(idPedido: number, dto: UpdateOrderStatusRequestDto): Observable<ApiResponse<UpdateOrderStatusDataDto>> {
		return this.http.patch<ApiResponse<UpdateOrderStatusDataDto>>(
			buildApiUrl(API_ENDPOINTS.orders.orderStatusUpdate(idPedido)),
			dto
		);
	}

	listPendingPaymentOrders(dto?: ListPendingPaymentOrdersRequestDto): Observable<ApiResponse<PendingPaymentOrderDto[]> & { pagination: PaginationMetaDto }> {
		return this.http.get<ApiResponse<PendingPaymentOrderDto[]> & { pagination: PaginationMetaDto }>(
			buildApiUrl(API_ENDPOINTS.payments.pendingOrders()),
			{
			params: dto as any
			}
		);
	}

	listPaymentMethods(): Observable<ApiResponse<MetodoPago[]>> {
		return this.http.get<ApiResponse<MetodoPago[]>>(buildApiUrl(API_ENDPOINTS.payments.methods()));
	}

	createPaymentMethod(dto: CreatePaymentMethodRequestDto): Observable<ApiResponse<MetodoPago>> {
		return this.http.post<ApiResponse<MetodoPago>>(buildApiUrl(API_ENDPOINTS.payments.methods()), dto);
	}

	getPaymentMethodById(idMetodo: number): Observable<ApiResponse<MetodoPago>> {
		return this.http.get<ApiResponse<MetodoPago>>(buildApiUrl(API_ENDPOINTS.payments.methodDetail(idMetodo)));
	}

	updatePaymentMethod(idMetodo: number, dto: UpdatePaymentMethodRequestDto): Observable<ApiResponse<MetodoPago>> {
		return this.http.put<ApiResponse<MetodoPago>>(
			buildApiUrl(API_ENDPOINTS.payments.methodDetail(idMetodo)),
			dto
		);
	}

	deletePaymentMethod(idMetodo: number): Observable<ApiResponse<null>> {
		return this.http.delete<ApiResponse<null>>(buildApiUrl(API_ENDPOINTS.payments.methodDetail(idMetodo)));
	}

	registerPayment(idPedido: number, dto: RegisterPaymentRequestDto): Observable<ApiResponse<RegisterPaymentDataDto>> {
		return this.http.post<ApiResponse<RegisterPaymentDataDto>>(
			buildApiUrl(API_ENDPOINTS.payments.register(idPedido)),
			dto
		);
	}

	createMercadoPagoPreference(idPedido: number): Observable<ApiResponse<MercadoPagoPreferenceDataDto>> {
		return this.http.post<ApiResponse<MercadoPagoPreferenceDataDto>>(
			buildApiUrl(API_ENDPOINTS.payments.mercadoPagoPreference(idPedido)),
			{}
		);
	}

	getPaymentHistory(dto?: PaymentHistoryRequestDto): Observable<ApiResponse<Pago[]> & { pagination: PaginationMetaDto }> {
		return this.http.get<ApiResponse<Pago[]> & { pagination: PaginationMetaDto }>(
			buildApiUrl(API_ENDPOINTS.payments.history()),
			{
			params: dto as any
			}
		);
	}

	listAllPayments(dto?: ListAllPaymentsRequestDto): Observable<ApiResponse<Pago[]> & { pagination: PaginationMetaDto }> {
		return this.http.get<ApiResponse<Pago[]> & { pagination: PaginationMetaDto }>(
			buildApiUrl(API_ENDPOINTS.payments.all()),
			{
			params: dto as any
			}
		);
	}

	getPaymentDetail(idPago: number): Observable<ApiResponse<Pago>> {
		return this.http.get<ApiResponse<Pago>>(buildApiUrl(API_ENDPOINTS.payments.paymentDetail(idPago)));
	}

	downloadReceipt(idPago: number): Observable<ArrayBuffer> {
		return this.http.get(buildApiUrl(API_ENDPOINTS.payments.receipt(idPago)), { responseType: "arraybuffer" });
	}
}
