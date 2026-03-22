import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Producto } from '../../../../../../domain/inventory/models/producto.model';
import { ProductoPromocionItem } from '../../../../../../domain/events&Promotions/models/productoPromocion.model';
import { EventsPromotionsApi } from '../../../../../../services/apis/events&Promotions.api';
import { InventoryApi } from '../../../../../../services/apis/inventory.api';
import { OrdersApi } from '../../../../../../services/apis/orders.api';
import { SharedModule } from '../../../../../../shared/shared-module';
import { LayoutModule } from '../../../../../../shared/layout/layout-module';

@Component({
  selector: 'app-catalog-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule, LayoutModule],
  templateUrl: './catalog-detail.page.html',
  styleUrl: './catalog-detail.page.scss'
})
export class CatalogDetailPage implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  loading = true;
  error = '';

  producto: Producto | null = null;
  precioPromocional: number | null = null;
  porcentajeDescuento: number | null = null;
  tienePromocion = false;
  agregandoCarrito = false;
  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';

  mode: 'public' | 'client' = 'public';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly inventoryApi: InventoryApi,
    private readonly eventsPromotionsApi: EventsPromotionsApi,
    private readonly ordersApi: OrdersApi
  ) {}

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['marketplaceMode'] === 'client' ? 'client' : 'public';
    this.loadProductFromRoute();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  volver(): void {
    if (this.mode === 'client') {
      this.router.navigate(['/client/catalogo']);
      return;
    }

    this.router.navigate(['/catalogo']);
  }

  irALogin(): void {
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: `/client/catalogo/${this.producto?.idProducto ?? ''}` }
    });
  }

  agregarAlCarrito(): void {
    if (!this.producto || this.mode !== 'client' || this.agregandoCarrito) {
      return;
    }

    if (this.producto.stockActual <= 0) {
      this.tipoMensaje = 'error';
      this.mensaje = 'Este producto no tiene stock disponible.';
      return;
    }

    this.agregandoCarrito = true;
    this.mensaje = '';

    this.ordersApi
      .addProductToCart({
        idProducto: Number(this.producto.idProducto),
        cantidad: 1
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.tipoMensaje = 'error';
            this.mensaje = response.message || 'No se pudo agregar el producto al carrito.';
            this.agregandoCarrito = false;
            return;
          }

          this.tipoMensaje = 'success';
          this.mensaje = response.message || 'Producto agregado al carrito.';
          this.agregandoCarrito = false;
        },
        error: (error) => {
          this.tipoMensaje = 'error';
          this.mensaje = error?.message || 'No se pudo agregar el producto al carrito.';
          this.agregandoCarrito = false;
        }
      });
  }

  get imageUrl(): string {
    if (!this.producto) {
      return '/img/default_product.png';
    }

    return this.inventoryApi.resolveImageUrl(this.producto.urlImagen);
  }

  private loadProductFromRoute(): void {
    const id = Number(this.route.snapshot.paramMap.get('idProducto'));

    if (!id || Number.isNaN(id)) {
      this.loading = false;
      this.error = 'Producto inválido.';
      return;
    }

    this.inventoryApi
      .getCatalogDetail(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.loading = false;
            this.error = response.message || 'No fue posible obtener el detalle del producto.';
            return;
          }

          this.producto = response.data;
          this.loadPromotionData(response.data.idProducto);
        },
        error: (error) => {
          this.loading = false;
          this.error = error?.message || 'No fue posible obtener el detalle del producto.';
        }
      });
  }

  private loadPromotionData(productId: number): void {
    this.eventsPromotionsApi
      .getPromotionsByProduct(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const promotion = this.getActivePromotion(response.data?.promociones || []);

          if (promotion && this.producto) {
            this.tienePromocion = true;
            this.precioPromocional = promotion.precioPromocional;
            this.porcentajeDescuento = promotion.porcentajeDescuento;
          }

          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  private getActivePromotion(promociones: ProductoPromocionItem[]): { precioPromocional: number; porcentajeDescuento: number | null } | null {
    if (!this.producto) {
      return null;
    }

    const now = new Date().getTime();

    for (const item of promociones) {
      const detail = item.detallePromocion;
      const start = detail?.fechaInicio ? new Date(detail.fechaInicio).getTime() : NaN;
      const end = detail?.fechaFin ? new Date(detail.fechaFin).getTime() : NaN;

      if (!detail?.activo || Number.isNaN(start) || Number.isNaN(end) || now < start || now > end) {
        continue;
      }

      const descuento = Number(item.porcentajeDescuento);
      const precioPromo = Number(item.precioPromocional);

      if (!Number.isNaN(precioPromo) && precioPromo > 0 && precioPromo < this.producto.precio) {
        const descuentoCalculado = Math.round(((this.producto.precio - precioPromo) / this.producto.precio) * 100);
        return {
          precioPromocional: precioPromo,
          porcentajeDescuento: !Number.isNaN(descuento) && descuento > 0 ? descuento : descuentoCalculado
        };
      }

      if (!Number.isNaN(descuento) && descuento > 0) {
        const calculado = Math.max(0, Math.round(this.producto.precio - (this.producto.precio * descuento) / 100));
        if (calculado < this.producto.precio) {
          return {
            precioPromocional: calculado,
            porcentajeDescuento: descuento
          };
        }
      }
    }

    return null;
  }
}
