import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { OrdersApi } from '../../../../../services/apis/orders.api';
import { ApiResponse } from '../../../../../types/api-response.type';
import { Pedido, ProductoPedidoItem, EstadoPedido, CanalVenta, TipoAtencion } from '../../../../../domain/orders/models/pedido.model';
import { Pago, MetodoPago } from '../../../../../domain/orders/models/pago.model';
import { PaginationMetaDto } from '../../../../../types/pagination-meta.dto';
import { CreateCustomerOrderRequestDto } from '../../../../../domain/orders/dtos/request/create-customer-order.request.dto';
import { AddProductToOrderRequestDto } from '../../../../../domain/orders/dtos/request/add-product-to-order.request.dto';
import { UpdateOrderProductQuantityRequestDto } from '../../../../../domain/orders/dtos/request/update-order-product-quantity.request.dto';
import { UpdateOrderStatusRequestDto } from '../../../../../domain/orders/dtos/request/update-order-status.request.dto';
import { RegisterPaymentRequestDto } from '../../../../../domain/orders/dtos/request/register-payment.request.dto';
import { ListAllOrdersRequestDto } from '../../../../../domain/orders/dtos/request/list-all-orders.request.dto';
import { PaymentHistoryRequestDto } from '../../../../../domain/orders/dtos/request/payment-history.request.dto';
import { ListPendingPaymentOrdersRequestDto } from '../../../../../domain/orders/dtos/request/list-pending-payment-orders.request.dto';
import { CreateCustomerOrderDataDto } from '../../../../../domain/orders/dtos/response/create-customer-order.response.dto';
import { AddProductToOrderDataDto } from '../../../../../domain/orders/dtos/response/add-product-to-order.response.dto';
import { UpdateOrderStatusDataDto } from '../../../../../domain/orders/dtos/response/update-order-status.response.dto';
import { PendingPaymentOrderDto } from '../../../../../domain/orders/dtos/response/list-pending-payment-orders.response.dto';
import { RegisterPaymentDataDto } from '../../../../../domain/orders/dtos/response/register-payment.response.dto';
import { UpdateOrderProductQuantityDataDto } from '../../../../../domain/orders/dtos/response/update-order-product-quantity.response.dto';

export interface PosOrderLine {
  idProducto: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  idProductoPedido: number;
}

export interface PosOrderSummary {
  idPedido: number;
  idMesa: number;
  estado: EstadoPedido;
  canalVenta: CanalVenta;
  tipoAtencion?: TipoAtencion;
  direccionEntrega?: string;
  total: number;
  lineas: PosOrderLine[];
}

export interface PosCreateOrderPayload {
  idMesa: number;
  idProducto: number;
  cantidad: number;
  canalVenta: CanalVenta;
  tipoAtencion?: TipoAtencion;
  direccionEntrega?: string;
  idCliente?: number;
}

export interface PaymentMethodOption {
  value: number;
  label: string;
}

export interface ProductPromotionPricingItem {
  idProducto: number;
  precioOriginal: number;
  precioPromocional: number | null;
  tienePromocion: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersFacade {
  constructor(private ordersApi: OrdersApi) { }

  createCustomerOrder(dto: CreateCustomerOrderRequestDto): Observable<ApiResponse<CreateCustomerOrderDataDto>> {
    return this.ordersApi.createCustomerOrder(dto);
  }

  addProductToOrder(idPedido: number, dto: AddProductToOrderRequestDto): Observable<ApiResponse<AddProductToOrderDataDto>> {
    return this.ordersApi.addProductToOrder(idPedido, dto);
  }

  removeProductFromOrder(idPedido: number, idProductoPedido: number): Observable<ApiResponse<null>> {
    return this.ordersApi.removeProductFromOrder(idPedido, idProductoPedido);
  }

  updateOrderProductQuantity(
    idPedido: number,
    idProductoPedido: number,
    cantidadOrDto: number | UpdateOrderProductQuantityRequestDto
  ): Observable<ApiResponse<UpdateOrderProductQuantityDataDto>> {
    const dto: UpdateOrderProductQuantityRequestDto = typeof cantidadOrDto === 'number'
      ? { cantidad: cantidadOrDto }
      : cantidadOrDto;

    return this.ordersApi.updateOrderProductQuantity(idPedido, idProductoPedido, dto);
  }

  deleteOrder(idPedido: number): Observable<ApiResponse<null>> {
    return this.ordersApi.deleteOrder(idPedido);
  }

  getOrderById(idPedido: number): Observable<ApiResponse<{ pedido: Pedido; productos: ProductoPedidoItem[] }>> {
    return this.ordersApi.getOrderById(idPedido);
  }

  getProductsPromotionPricing(productIds: number[]): Observable<Record<number, ProductPromotionPricingItem>> {
    const normalizedIds = Array.from(new Set((productIds || []).map(id => Number(id)).filter(id => Number.isFinite(id) && id > 0)));

    if (normalizedIds.length === 0) {
      return of({});
    }

    return this.ordersApi.getProductsPromotionPricing(normalizedIds).pipe(
      map(response => {
        const items = response.data?.items ?? [];
        return items.reduce((acc, item) => {
          acc[Number(item.idProducto)] = {
            idProducto: Number(item.idProducto),
            precioOriginal: Number(item.precioOriginal || 0),
            precioPromocional: item.precioPromocional === null || typeof item.precioPromocional === 'undefined'
              ? null
              : Number(item.precioPromocional),
            tienePromocion: Boolean(item.tienePromocion)
          };
          return acc;
        }, {} as Record<number, ProductPromotionPricingItem>);
      })
    );
  }

  listAllOrders(dto?: ListAllOrdersRequestDto): Observable<ApiResponse<Pedido[]> & { pagination: PaginationMetaDto }> {
    return this.ordersApi.listAllOrders(dto);
  }

  listAllOrdersRaw(): Observable<Pedido[]> {
    return this.ordersApi.listAllOrders({ page: 1, limit: 200 }).pipe(
      map(response => response.data ?? [])
    );
  }

  getOpenOrderByMesa(idMesa: number): Observable<Pedido | null> {
    return this.ordersApi.getOpenOrderByMesa(idMesa).pipe(
      map(response => response.data?.pedido ?? null)
    );
  }

  getOrderSummary(idPedido: number): Observable<PosOrderSummary> {
    return this.ordersApi.getOrderById(idPedido).pipe(
      map(response => {
        const pedido = response.data?.pedido as Pedido;
        const productos = (response.data?.productos ?? pedido?.productos ?? []) as ProductoPedidoItem[];

        const grouped = new Map<number, PosOrderLine>();
        for (const item of productos) {
          const idProducto = Number(item.idProducto);
          const existente = grouped.get(idProducto);
          if (existente) {
            existente.cantidad += Number(item.cantidad);
            existente.subtotal += Number(item.subtotal);
            if (!existente.idProductoPedido) {
              existente.idProductoPedido = item.idProductoPedido;
            }
          } else {
            grouped.set(idProducto, {
              idProducto,
              nombre: item.productoNombre || `Producto #${idProducto}`,
              precioUnitario: Number(item.precioUnitario || 0),
              cantidad: Number(item.cantidad || 0),
              subtotal: Number(item.subtotal || 0),
              idProductoPedido: item.idProductoPedido
            });
          }
        }

        const lineas = Array.from(grouped.values()).sort((a, b) => a.idProducto - b.idProducto);
        return {
          idPedido: pedido.idPedido,
          idMesa: Number(pedido.idMesa || 0),
          estado: pedido.estado,
          canalVenta: pedido.canalVenta,
          tipoAtencion: pedido.tipoAtencion,
          direccionEntrega: pedido.direccionEntrega,
          total: Number(pedido.total || 0),
          lineas
        };
      })
    );
  }

  createOrderWithFirstProduct(payload: PosCreateOrderPayload): Observable<ApiResponse<CreateCustomerOrderDataDto>> {
    const dto: CreateCustomerOrderRequestDto = {
      idMesa: payload.idMesa,
      productos: [{ idProducto: payload.idProducto, cantidad: payload.cantidad }]
    };

    return this.ordersApi.createCustomerOrder(dto);
  }

  addProductToOpenOrderByMesa(payload: PosCreateOrderPayload): Observable<PosOrderSummary> {
    return this.getOpenOrderByMesa(payload.idMesa).pipe(
      switchMap(pedidoAbierto => {
        if (!pedidoAbierto) {
          return this.createOrderWithFirstProduct(payload).pipe(
            switchMap(response => {
              const idPedido = Number(response.data?.pedido?.idPedido);
              return this.getOrderSummary(idPedido);
            })
          );
        }

        const dto: AddProductToOrderRequestDto = {
          idProducto: payload.idProducto,
          cantidad: payload.cantidad
        };
        return this.ordersApi.addProductToOrder(pedidoAbierto.idPedido, dto).pipe(
          switchMap(() => this.getOrderSummary(pedidoAbierto.idPedido))
        );
      })
    );
  }

  decreaseProductFromOrder(summary: PosOrderSummary, idProducto: number): Observable<PosOrderSummary> {
    const line = summary.lineas.find(item => item.idProducto === idProducto);
    if (!line) {
      return of(summary);
    }

    if (line.cantidad <= 1) {
      return this.ordersApi.removeProductFromOrder(summary.idPedido, line.idProductoPedido).pipe(
        switchMap(() => this.getOrderSummary(summary.idPedido))
      );
    }

    return this.updateOrderProductQuantity(summary.idPedido, line.idProductoPedido, line.cantidad - 1).pipe(
      switchMap(() => this.getOrderSummary(summary.idPedido))
    );
  }

  listPendingPaymentOrders(dto?: ListPendingPaymentOrdersRequestDto): Observable<ApiResponse<PendingPaymentOrderDto[]> & { pagination: PaginationMetaDto }> {
    return this.ordersApi.listPendingPaymentOrders(dto);
  }

  updateOrderStatus(idPedido: number, nuevoEstado: EstadoPedido): Observable<ApiResponse<UpdateOrderStatusDataDto>> {
    const dto: UpdateOrderStatusRequestDto = { nuevoEstado };
    return this.ordersApi.updateOrderStatus(idPedido, dto);
  }

  getPaymentHistory(dto?: PaymentHistoryRequestDto): Observable<ApiResponse<Pago[]> & { pagination: PaginationMetaDto }> {
    return this.ordersApi.getPaymentHistory(dto);
  }

  listPaymentMethods(): Observable<ApiResponse<MetodoPago[]>> {
    return this.ordersApi.listPaymentMethods();
  }

  listPosPaymentMethods(): Observable<PaymentMethodOption[]> {
    return this.ordersApi.listPaymentMethods().pipe(
      map(response => {
        const permitidos = new Set(['efectivo', 'tarjeta', 'transferencia']);

        return (response.data ?? [])
          .map(metodo => ({
            value: metodo.idMetodoPago,
            label: metodo.nombre
          }))
          .filter(metodo => permitidos.has(this.normalizeMetodo(metodo.label)))
          .sort((a, b) => a.label.localeCompare(b.label));
      })
    );
  }

  registerPayment(idPedido: number, dto: RegisterPaymentRequestDto): Observable<ApiResponse<RegisterPaymentDataDto>> {
    return this.ordersApi.registerPayment(idPedido, dto);
  }

  downloadReceipt(idPago: number): Observable<ArrayBuffer> {
    return this.ordersApi.downloadReceipt(idPago);
  }

  /** Devuelve pedidos realmente abiertos de mesa para POS. */
  getOpenOrders(): Observable<Pedido[]> {
    return this.ordersApi.listAllOrders({
      page: 1,
      limit: 200
    }).pipe(
      map(response => (response.data ?? []).filter(
        pedido => pedido.estado === EstadoPedido.SIN_CONFIRMAR
      ))
    );
  }

  private normalizeMetodo(nombre: string): string {
    return String(nombre)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
