import { CommonModule, Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CustomerOrderDetailDataDto } from '../../../../../../../domain/orders/dtos/response/get-customer-order-detail.response.dto';
import { ProductoPedidoItem } from '../../../../../../../domain/orders/models/pedido.model';
import { InventoryApi } from '../../../../../../../services/apis/inventory.api';
import { OrdersApi } from '../../../../../../../services/apis/orders.api';
import { SharedModule } from '../../../../../../../shared/shared-module';

@Component({
  selector: 'app-order-detail-page',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule],
  templateUrl: './order-detail.page.html',
  styleUrl: './order-detail.page.scss'
})
export class OrderDetailPage implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  idPedido = 0;
  detalle: CustomerOrderDetailDataDto | null = null;
  private productoDataCache = new Map<number, { nombre: string; imagen: string }>();

  loading = true;
  error = '';
  descargandoComprobante = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly ordersApi: OrdersApi,
    private readonly inventoryApi: InventoryApi,
    private readonly location: Location
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = Number(params.get('idPedido'));

      if (!id || Number.isNaN(id)) {
        this.error = 'El id de pedido no es valido.';
        this.loading = false;
        return;
      }

      this.idPedido = id;
      this.cargarDetalle();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  volverAlPerfil(): void {
    this.router.navigate(['/client/perfil'], {
      queryParams: { seccion: 'pedidos' }
    });
  }

  descargarComprobante(): void {
    if (!this.idPedido || this.descargandoComprobante) {
      return;
    }

    this.descargandoComprobante = true;

    this.ordersApi
      .downloadReceiptByOrderId(this.idPedido)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          const blob = new Blob([data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `comprobante-pedido-${this.idPedido}.pdf`;
          anchor.click();
          window.URL.revokeObjectURL(url);
          this.descargandoComprobante = false;
        },
        error: (error) => {
          this.error = error?.message || 'No se pudo descargar el comprobante.';
          this.descargandoComprobante = false;
        }
      });
  }

  reintentar(): void {
    this.cargarDetalle();
  }

  formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(valor) || 0);
  }

  formatoFecha(valor: string): string {
    const date = new Date(valor);

    if (Number.isNaN(date.getTime())) {
      return valor;
    }

    return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  resolveProductImageUrl(item: any): string {
    const raw = (item.productoImagen || '').trim();
    if (!raw) {
      console.log(`[TRACE-IMG-ORDER] resolveProductImageUrl id=${item.idProducto}: productoImagen vacio → fallback`);
      return '/img/default_product.png';
    }
    console.log(`[TRACE-IMG-ORDER] resolveProductImageUrl id=${item.idProducto}: productoImagen=${raw}`);
    return raw;
  }

  private cargarDetalle(): void {
    if (!this.idPedido) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.ordersApi
      .getCustomerOrderDetail(this.idPedido)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log(`[TRACE-IMG-ORDER] getCustomerOrderDetail response: success=${response.success}, hasData=${!!response.data}`);
          if (!response.success || !response.data) {
            this.error = response.message || 'No se pudo cargar el detalle del pedido.';
            this.loading = false;
            return;
          }

          this.detalle = response.data;
          console.log(`[TRACE-IMG-ORDER] detalle.productos: ${JSON.stringify(this.detalle.productos.map(p => ({idProducto: p.idProducto, productoImagen: (p as any).productoImagen})))}`);
          this.enriquecerProductos();
          this.loading = false;
        },
        error: (error) => {
          this.error = error?.message || 'No se pudo cargar el detalle del pedido.';
          this.loading = false;
        }
      });
  }

  private enriquecerProductos(): void {
    if (!this.detalle?.productos) return;

    const uniqueIds = [...new Set(this.detalle.productos.map(p => p.idProducto))];
    console.log(`[TRACE-IMG-ORDER] enriquecerProductos - uniqueIds: ${JSON.stringify(uniqueIds)}`);

    uniqueIds.forEach(idProducto => {
      if (this.productoDataCache.has(idProducto)) {
        console.log(`[TRACE-IMG-ORDER] enrich id=${idProducto} ya en cache, aplicando cache`);
        this.aplicarCacheAProductos(idProducto);
        return;
      }

      console.log(`[TRACE-IMG-ORDER] enrich GET product id=${idProducto}`);
      this.inventoryApi.getProduct(idProducto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            if (res.success && res.data) {
              const rawImagen = res.data.urlImagen || '';
              const safeImagen = rawImagen.startsWith('/images/')
                ? '/img/default_product.png'
                : this.inventoryApi.resolveImageUrl(rawImagen);
              console.log(`[TRACE-IMG-ORDER] enrich GET ${idProducto}: urlImagen=${rawImagen}, safeUrl=${safeImagen}`);
              this.productoDataCache.set(idProducto, {
                nombre: res.data.nombre || '',
                imagen: safeImagen
              });
              this.aplicarCacheAProductos(idProducto);
            } else {
              console.log(`[TRACE-IMG-ORDER] enrich GET ${idProducto} failed: ${JSON.stringify(res)}`);
            }
          }
        });
    });
  }

  private aplicarCacheAProductos(idProducto: number): void {
    if (!this.detalle?.productos) return;

    const data = this.productoDataCache.get(idProducto);
    console.log(`[TRACE-IMG-ORDER] aplicarCacheAProductos id=${idProducto}, cacheData=${JSON.stringify(data)}`);
    if (!data) return;

    this.detalle.productos.forEach(item => {
      if (item.idProducto === idProducto) {
        (item as any).productoNombre = data.nombre;
        (item as any).productoImagen = data.imagen;
        console.log(`[TRACE-IMG-ORDER] item ${idProducto}.productoImagen=${item.productoImagen}`);
      }
    });
  }
}

