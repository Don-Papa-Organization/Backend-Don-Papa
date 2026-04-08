import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ConfirmOrderRequestDto } from '../../../../../../../domain/orders/dtos/request/confirm-order.request.dto';
import { UpdateCartProductRequestDto } from '../../../../../../../domain/orders/dtos/request/update-cart-product.request.dto';
import { GetCartDataDto } from '../../../../../../../domain/orders/dtos/response/get-cart.response.dto';
import { ProductoPedidoItem } from '../../../../../../../domain/orders/models/pedido.model';
import { Producto } from '../../../../../../../domain/inventory/models/producto.model';
import { AuthProfileResponseDto } from '../../../../../../../domain/users/dtos/response/auth-profile.response.dto';
import { OrdersApi } from '../../../../../../../services/apis/orders.api';
import { InventoryApi } from '../../../../../../../services/apis/inventory.api';
import { UsersApi } from '../../../../../../../services/apis/users.api';
import { SharedModule } from '../../../../../../../shared/shared-module';
import { UiCartItemComponent } from '../../../../../../../shared/ui/cart-item/cart-item.component';
import { UiCartRemovalModalComponent } from '../../../../../../../shared/ui/cart-removal-modal/cart-removal-modal.component';
import { UiEmptyCartComponent } from '../../../../../../../shared/ui/empty-cart/empty-cart.component';
import { LayoutModule } from '../../../../../../../shared/layout/layout-module';

interface CartItemView extends ProductoPedidoItem {
  stockActual?: number;
  productoEstaEnStock?: boolean;
  razonBloqueo?: string;
  productoImagen?: string;
  productoNombre?: string;
}

@Component({
  selector: 'app-orders-cart-page',
  standalone: true,
  imports: [CommonModule, SharedModule, LayoutModule, UiCartItemComponent, UiCartRemovalModalComponent, UiEmptyCartComponent],
  templateUrl: './orders-cart.page.html',
  styleUrl: './orders-cart.page.scss'
})
export class OrdersCartPage implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly stockCheckInterval = 30000;
  private stockCheckTimer: any;

  loading = true;
  error = '';
  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';

  cart: GetCartDataDto | null = null;
  cartItemsView: CartItemView[] = [];
  private productoDataCache = new Map<number, { nombre: string; imagen: string }>();

  confirmandoPedido = false;
  limpiandoCarrito = false;
  procesandoPago = false;
  perfilCompleto = true;
  validandoPerfil = false;

  modalEliminar = {
    mostrar: false,
    productName: '',
    isConfirming: false,
    itemToRemove: null as CartItemView | null
  };

  constructor(
    private readonly ordersApi: OrdersApi,
    private readonly inventoryApi: InventoryApi,
    private readonly usersApi: UsersApi,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCarrito();
    this.iniciarValidacionStock();
    this.validarPerfilCliente();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.stockCheckTimer) {
      clearInterval(this.stockCheckTimer);
    }
  }

  get productos(): CartItemView[] {
    return this.cartItemsView;
  }

  get carritoVacio(): boolean {
    return !this.loading && !this.error && this.productos.length === 0;
  }

  get totalCarrito(): number {
    return Number(this.cart?.pedido?.total || 0);
  }

  get hayProductosBloqueados(): boolean {
    return this.productos.some(p => !p.productoEstaEnStock);
  }

  get puedeComprar(): boolean {
    return this.perfilCompleto && !this.hayProductosBloqueados && this.productos.length > 0;
  }

  private resolveProductImageLikeCatalog(producto: { idProducto?: number; urlImagen?: string | null; productoImagen?: string | null }): string {
    const raw = ((producto.urlImagen ?? producto.productoImagen) || '').replace(/\\/g, '/').trim();

    if (!raw) {
      return '/img/default_product.png';
    }

    if (/^https?:\/\//i.test(raw)) {
      return raw;
    }

    if (raw.startsWith('/img/') || raw.startsWith('img/')) {
      return raw.startsWith('/') ? raw : `/${raw}`;
    }

    if (raw.startsWith('/images/') || raw.startsWith('images/')) {
      const normalized = raw.startsWith('/') ? raw : `/${raw}`;
      const idProducto = Number(producto.idProducto);
      if (Number.isFinite(idProducto) && idProducto > 0) {
        return this.inventoryApi.getProductImageUrl(idProducto);
      }
      return this.inventoryApi.resolveImageUrl(normalized);
    }

    return this.inventoryApi.resolveImageUrl(raw);
  }

  resolveImageUrl(producto: CartItemView): string {
    const raw = (producto.productoImagen || '').replace(/\\/g, '/').trim();
    console.log(`[TRACE-IMG-CART] resolveImageUrl - idProducto=${producto.idProducto}, productoImagen=${JSON.stringify(producto.productoImagen)}, raw=${raw}`);

    const apiResult = this.resolveProductImageLikeCatalog({
      idProducto: producto.idProducto,
      productoImagen: raw
    });
    console.log(`[TRACE-IMG-CART] resolveImageUrl - ${producto.idProducto}: raw=${raw} → apiResolve=${apiResult}`);
    return apiResult;
  }

  formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor || 0);
  }

  reintentar(): void {
    this.cargarCarrito();
  }

  actualizarCantidad(item: CartItemView, nuevaCantidad: number): void {
    this.mensaje = '';

    if (!Number.isFinite(nuevaCantidad) || nuevaCantidad <= 0) {
      this.tipoMensaje = 'error';
      this.mensaje = 'La cantidad debe ser mayor a 0.';
      return;
    }

    const dto: UpdateCartProductRequestDto = { cantidad: nuevaCantidad };

    this.ordersApi
      .updateProductQuantity(item.idProductoPedido, dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.tipoMensaje = 'error';
            this.mensaje = response.message || 'No se pudo actualizar la cantidad.';
            return;
          }

          this.tipoMensaje = 'success';
          this.mensaje = 'Cantidad actualizada.';
          this.cargarCarrito();
        },
        error: (error) => {
          this.tipoMensaje = 'error';
          this.mensaje = error?.message || 'No se pudo actualizar la cantidad.';
        }
      });
  }

  abrirModalEliminar(item: CartItemView): void {
    this.modalEliminar.mostrar = true;
    this.modalEliminar.productName = item.productoNombre || 'Producto';
    this.modalEliminar.itemToRemove = item;
  }

  onConfirmRemove(): void {
    if (!this.modalEliminar.itemToRemove) return;

    this.modalEliminar.isConfirming = true;
    const item = this.modalEliminar.itemToRemove;

    this.ordersApi
      .removeProductFromCart(item.idProductoPedido)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.modalEliminar.isConfirming = false;
          this.modalEliminar.mostrar = false;

          if (!response.success) {
            this.tipoMensaje = 'error';
            this.mensaje = response.message || 'No se pudo quitar el producto.';
            return;
          }

          this.tipoMensaje = 'success';
          this.mensaje = 'Producto eliminado del carrito.';
          this.cargarCarrito();
        },
        error: (error) => {
          this.modalEliminar.isConfirming = false;
          this.tipoMensaje = 'error';
          this.mensaje = error?.message || 'No se pudo quitar el producto.';
        }
      });
  }

  onCancelRemove(): void {
    this.modalEliminar.mostrar = false;
    this.modalEliminar.itemToRemove = null;
  }

  limpiarCarrito(): void {
    this.mensaje = '';
    this.limpiandoCarrito = true;

    this.ordersApi
      .clearCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.limpiandoCarrito = false;

          if (!response.success) {
            this.tipoMensaje = 'error';
            this.mensaje = response.message || 'No se pudo limpiar el carrito.';
            return;
          }

          this.tipoMensaje = 'success';
          this.mensaje = 'Carrito limpiado.';
          this.cargarCarrito();
        },
        error: (error) => {
          this.limpiandoCarrito = false;
          this.tipoMensaje = 'error';
          this.mensaje = error?.message || 'No se pudo limpiar el carrito.';
        }
      });
  }

  confirmarPedido(): void {
    if (!this.perfilCompleto) {
      this.mostrarMensajePerfilIncompleto();
      return;
    }

    this.usersApi.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data || !this.esPerfilCompleto(response.data)) {
            this.perfilCompleto = false;
            this.mostrarMensajePerfilIncompleto();
            return;
          }
          this.perfilCompleto = true;
          this.ejecutarPago();
        },
        error: () => {
          this.perfilCompleto = false;
          this.mostrarMensajePerfilIncompleto();
        }
      });
  }

  private ejecutarPago(): void {
    if (this.hayProductosBloqueados) {
      this.tipoMensaje = 'error';
      this.mensaje = 'No puedes comprar con productos bloqueados.';
      return;
    }

    const idPedido = this.cart?.pedido?.idPedido;
    this.tipoMensaje = 'success';
    this.mensaje = 'Redirigiendo al pago...';
    this.router.navigate(['/client/pedidos/pagos/registrar', idPedido || 'pending']);
  }

  completarPerfil(): void {
    this.mostrarMensajePerfilIncompleto();
  }

  private mostrarMensajePerfilIncompleto(): void {
    this.tipoMensaje = 'error';
    this.mensaje = 'Completa tu perfil (nombre, telefono, direccion) para continuar con el pago.';
    this.router.navigate(['/client/perfil'], {
      queryParams: { completar: true }
    });
  }

  private iniciarValidacionStock(): void {
    this.stockCheckTimer = setInterval(() => {
      this.validarStockActual();
    }, this.stockCheckInterval);
  }

  private validarStockActual(): void {
    if (!this.cart?.productos || this.cart.productos.length === 0) return;

    this.cart.productos.forEach((item: any) => {
      const cached = this.productoDataCache.get(item.idProducto);
      if (cached) {
        const cartItem = this.cartItemsView.find(ci => ci.idProducto === item.idProducto);
        if (cartItem) {
          console.log(`[TRACE-IMG-CART] validarStockActual id=${item.idProducto}: using cached stock, productoImagen=${cartItem.productoImagen}`);
        }
      }
    });
  }

  private cargarCarrito(): void {
    this.loading = true;
    this.error = '';
    this.mensaje = '';

    this.ordersApi
      .getCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;

          if (!response.success) {
            this.error = response.message || 'No se pudo cargar el carrito.';
            return;
          }

          this.cart = response.data;
          console.log(`[TRACE-IMG-CART] getCart response: ${JSON.stringify(this.cart?.productos?.map((p: any) => ({idProducto: p.idProducto, urlImagen: p.urlImagen, productoImagen: p.productoImagen})))}`);
          this.mapearCartItems();
          this.enriquecerProductos();
          this.validarStockActual();
        },
        error: (error) => {
          this.loading = false;
          this.error = error?.message || 'No se pudo cargar el carrito.';
        }
      });
  }

  private enriquecerProductos(): void {
    if (!this.cart?.productos) return;

    const uniqueIds = [...new Set(this.cart.productos.map(p => p.idProducto))];
    console.log(`[TRACE-IMG-CART] enriquecerProductos - uniqueIds: ${JSON.stringify(uniqueIds)}`);

    uniqueIds.forEach(idProducto => {
      if (this.productoDataCache.has(idProducto)) {
        console.log(`[TRACE-IMG-CART] enriquecerProductos - idProducto=${idProducto} ya esta en cache, omite`);
        return;
      }

      console.log(`[TRACE-IMG-CART] enriquecerProductos - GET product id=${idProducto}`);
      this.inventoryApi.getProduct(idProducto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            if (res.success && res.data) {
              const rawUrl = res.data.urlImagen || '';
              const safeUrl = this.resolveProductImageLikeCatalog({
                idProducto,
                urlImagen: rawUrl
              });
              console.log(`[TRACE-IMG-CART] enriquecerProductos - GET product ${idProducto} response: urlImagen=${rawUrl}, safeUrl=${safeUrl}`);
              this.productoDataCache.set(idProducto, {
                nombre: res.data.nombre || '',
                imagen: safeUrl
              });
              this.cartItemsView.forEach(item => {
                if (item.idProducto === idProducto) {
                  const data = this.productoDataCache.get(idProducto);
                  if (data) {
                    item.productoNombre = data.nombre;
                    item.productoImagen = data.imagen;
                    console.log(`[TRACE-IMG-CART] enriquecerProductos - item ${idProducto}.productoImagen=${item.productoImagen}`);
                  }
                }
              });
            } else {
              console.log(`[TRACE-IMG-CART] enrich GET ${idProducto} failed: ${JSON.stringify(res)}`);
            }
          }
        });
    });
  }

  private validarPerfilCliente(): void {
    this.validandoPerfil = true;

    this.usersApi
      .getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.validandoPerfil = false;

          if (!response.success || !response.data) {
            this.perfilCompleto = false;
            return;
          }

          this.perfilCompleto = this.esPerfilCompleto(response.data);
        },
        error: () => {
          this.validandoPerfil = false;
          this.perfilCompleto = false;
        }
      });
  }

  private esPerfilCompleto(profile: AuthProfileResponseDto): boolean {
    const nombre = profile.cliente?.nombre?.trim() || '';
    const direccion = profile.cliente?.direccion?.trim() || '';
    const telefono = profile.cliente?.telefono?.trim() || '';
    const telefonoValido = /^\d{10}$/.test(telefono);

    return !!nombre && !!direccion && telefonoValido;
  }

  private mapearCartItems(): void {
    if (!this.cart?.productos) {
      this.cartItemsView = [];
      return;
    }

    this.cartItemsView = this.cart.productos.map((item: ProductoPedidoItem) => ({
      ...item,
      productoImagen: this.resolveProductImageLikeCatalog({
        idProducto: item.idProducto,
        urlImagen: (item as any).urlImagen,
        productoImagen: (item as any).productoImagen
      }),
      productoEstaEnStock: true,
      razonBloqueo: ''
    }));
  }
}

