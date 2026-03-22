import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { Subject, forkJoin, of, takeUntil } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductoPromocionItem } from '../../../../../../domain/events&Promotions/models/productoPromocion.model';
import { Producto } from '../../../../../../domain/inventory/models/producto.model';
import { CatalogProductEnrichedDto } from '../../../../../../domain/inventory/dtos/response/list-catalog-enriched.response.dto';
import { EventsPromotionsApi } from '../../../../../../services/apis/events&Promotions.api';
import { InventoryApi } from '../../../../../../services/apis/inventory.api';
import { OrdersApi } from '../../../../../../services/apis/orders.api';

export type ModalState = 'loading' | 'loaded' | 'adding-to-cart' | 'added-to-cart' | 'error';

interface RelatedProductView extends Producto {
  precioPromocional?: number | null;
  porcentajeDescuento?: number | null;
  tienePromocion?: boolean;
}

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail-modal.component.html',
  styleUrl: './product-detail-modal.component.scss'
})
export class ProductDetailModalComponent implements OnChanges, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private touchStartX: number | null = null;

  constructor(
    private readonly inventoryApi: InventoryApi,
    private readonly eventsPromotionsApi: EventsPromotionsApi,
    private readonly ordersApi: OrdersApi
  ) {}

  @Input() visible = false;
  @Input() productId: number | null = null;
  @Input() mode: 'public' | 'client' = 'public';
  @Input() isAuthenticated = false;

  @Output() closed = new EventEmitter<void>();
  @Output() openProduct = new EventEmitter<number>();
  @Output() actionMessage = new EventEmitter<{ type: 'success' | 'error'; message: string }>();

  @ViewChild('modalPanel') modalPanelRef?: ElementRef<HTMLElement>;
  @ViewChild('closeButton') closeButtonRef?: ElementRef<HTMLButtonElement>;

  state: ModalState = 'loading';
  producto: Producto | null = null;
  relatedProducts: RelatedProductView[] = [];

  // Pricing
  precioPromocional: number | null = null;
  porcentajeDescuento: number | null = null;
  tienePromocion = false;

  // Gallery
  galleryImages: string[] = [];
  selectedImageIndex = 0;
  lightboxOpen = false;

  // Quantity and feedback
  cantidad = 1;
  feedbackMessage = '';
  feedbackType: 'success' | 'error' = 'success';

  ngOnChanges(changes: SimpleChanges): void {
    const shouldLoad = this.visible && this.productId !== null && (
      changes['visible'] || changes['productId']
    );

    if (shouldLoad) {
      this.loadModalData(this.productId as number);
      setTimeout(() => this.focusInitialElement(), 0);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.visible) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }

    if (event.key === 'ArrowRight' && this.galleryImages.length > 1) {
      this.nextImage();
      return;
    }

    if (event.key === 'ArrowLeft' && this.galleryImages.length > 1) {
      this.prevImage();
      return;
    }

    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  close(): void {
    this.lightboxOpen = false;
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }

  selectImage(index: number): void {
    if (index < 0 || index >= this.galleryImages.length) {
      return;
    }
    this.selectedImageIndex = index;
  }

  nextImage(): void {
    if (!this.galleryImages.length) {
      return;
    }
    this.selectedImageIndex = (this.selectedImageIndex + 1) % this.galleryImages.length;
  }

  prevImage(): void {
    if (!this.galleryImages.length) {
      return;
    }
    this.selectedImageIndex = (this.selectedImageIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
  }

  openLightbox(): void {
    if (!this.galleryImages.length) {
      return;
    }
    this.lightboxOpen = true;
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0]?.clientX ?? null;
  }

  onTouchEnd(event: TouchEvent): void {
    if (this.touchStartX === null) {
      return;
    }

    const endX = event.changedTouches[0]?.clientX ?? this.touchStartX;
    const delta = endX - this.touchStartX;
    this.touchStartX = null;

    if (Math.abs(delta) < 40) {
      return;
    }

    if (delta < 0) {
      this.nextImage();
    } else {
      this.prevImage();
    }
  }

  decreaseQuantity(): void {
    if (this.cantidad > 1) {
      this.cantidad -= 1;
    }
  }

  increaseQuantity(): void {
    if (!this.producto) {
      return;
    }

    const maxAllowed = Math.max(1, this.producto.stockActual || 1);
    if (this.cantidad < maxAllowed) {
      this.cantidad += 1;
    }
  }

  onQuantityInput(value: string): void {
    if (!this.producto) {
      return;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      this.cantidad = 1;
      return;
    }

    const maxAllowed = Math.max(1, this.producto.stockActual || 1);
    this.cantidad = Math.max(1, Math.min(maxAllowed, Math.floor(parsed)));
  }

  addToCart(): void {
    if (!this.producto) {
      return;
    }

    if (this.mode !== 'client' || !this.isAuthenticated) {
      this.feedbackType = 'error';
      this.feedbackMessage = 'Inicia sesión para agregar productos al carrito.';
      this.actionMessage.emit({ type: 'error', message: this.feedbackMessage });
      return;
    }

    if (this.producto.stockActual <= 0) {
      this.feedbackType = 'error';
      this.feedbackMessage = 'Este producto no tiene stock disponible.';
      return;
    }

    this.state = 'adding-to-cart';
    this.feedbackMessage = '';

    this.ordersApi
      .addProductToCart({ idProducto: Number(this.producto.idProducto), cantidad: this.cantidad })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (!response.success) {
            this.state = 'error';
            this.feedbackType = 'error';
            this.feedbackMessage = response.message || 'No se pudo agregar el producto al carrito.';
            this.actionMessage.emit({ type: 'error', message: this.feedbackMessage });
            return;
          }

          this.state = 'added-to-cart';
          this.feedbackType = 'success';
          this.feedbackMessage = response.message || 'Producto agregado al carrito.';
          this.actionMessage.emit({ type: 'success', message: this.feedbackMessage });

          setTimeout(() => {
            if (this.visible) {
              this.state = 'loaded';
            }
          }, 1200);
        },
        error: (error: any) => {
          this.state = 'error';
          this.feedbackType = 'error';
          this.feedbackMessage = error?.message || 'No se pudo agregar el producto al carrito.';
          this.actionMessage.emit({ type: 'error', message: this.feedbackMessage });
        }
      });
  }

  onRelatedClick(product: RelatedProductView): void {
    this.openProduct.emit(product.idProducto);
  }

  get currentImage(): string {
    if (!this.galleryImages.length) {
      return '/img/default_product.png';
    }

    return this.galleryImages[this.selectedImageIndex] || '/img/default_product.png';
  }

  get isLowStock(): boolean {
    return !!this.producto && this.producto.stockActual > 0 && this.producto.stockActual <= 8;
  }

  get canAddToCart(): boolean {
    return !!this.producto && this.producto.stockActual > 0 && this.state !== 'adding-to-cart';
  }

  relatedImageUrl(product: RelatedProductView): string {
    return this.resolveProductImageUrl(product);
  }

  private loadModalData(id: number): void {
    this.resetState();
    this.state = 'loading';

    forkJoin({
      detail: this.inventoryApi.getCatalogDetail(id),
      promotions: this.eventsPromotionsApi.getPromotionsByProduct(id).pipe(
        catchError(() => of({ success: true, data: { promociones: [] } } as any))
      )
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ detail, promotions }: any) => {
          if (!detail.success || !detail.data) {
            this.state = 'error';
            this.feedbackType = 'error';
            this.feedbackMessage = detail.message || 'No fue posible cargar el detalle del producto.';
            return;
          }

          this.producto = detail.data;
          this.resolvePromotion(promotions?.data?.promociones || []);
          this.galleryImages = this.resolveGallery(detail.data);
          this.selectedImageIndex = 0;
          this.cantidad = 1;
          this.loadRelatedProducts(detail.data);
          this.state = 'loaded';
        },
        error: (error: any) => {
          this.state = 'error';
          this.feedbackType = 'error';
          this.feedbackMessage = error?.message || 'No fue posible cargar el detalle del producto.';
        }
      });
  }

  private loadRelatedProducts(product: Producto): void {
    if (!product.idCategoria) {
      this.relatedProducts = [];
      return;
    }

    this.inventoryApi
      .listCatalogEnriched({
        page: 1,
        limit: 10,
        categoria: product.idCategoria,
        ordenarPor: 'nombre',
        orden: 'asc'
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const items: CatalogProductEnrichedDto[] = response.data?.productos || [];
          this.relatedProducts = items
            .filter((item: CatalogProductEnrichedDto) => item.idProducto !== product.idProducto)
            .slice(0, 4)
            .map((item: CatalogProductEnrichedDto) => ({
              ...item,
              precioPromocional: item.precioPromocional ?? null,
              porcentajeDescuento: item.porcentajeDescuento ?? null,
              tienePromocion: !!item.tienePromocion
            }));
        },
        error: () => {
          this.relatedProducts = [];
        }
      });
  }

  private resolvePromotion(promociones: ProductoPromocionItem[]): void {
    this.tienePromocion = false;
    this.precioPromocional = null;
    this.porcentajeDescuento = null;

    if (!this.producto) {
      return;
    }

    const now = Date.now();

    for (const item of promociones) {
      const detail = item.detallePromocion;
      const start = detail?.fechaInicio ? new Date(detail.fechaInicio).getTime() : NaN;
      const end = detail?.fechaFin ? new Date(detail.fechaFin).getTime() : NaN;

      if (!detail?.activo || Number.isNaN(start) || Number.isNaN(end) || now < start || now > end) {
        continue;
      }

      const promoPrice = Number(item.precioPromocional);
      const discount = Number(item.porcentajeDescuento);

      if (!Number.isNaN(promoPrice) && promoPrice > 0 && promoPrice < this.producto.precio) {
        this.tienePromocion = true;
        this.precioPromocional = promoPrice;
        this.porcentajeDescuento = !Number.isNaN(discount) && discount > 0
          ? discount
          : Math.round(((this.producto.precio - promoPrice) / this.producto.precio) * 100);
        return;
      }

      if (!Number.isNaN(discount) && discount > 0) {
        const computed = Math.max(0, Math.round(this.producto.precio - (this.producto.precio * discount) / 100));
        if (computed < this.producto.precio) {
          this.tienePromocion = true;
          this.precioPromocional = computed;
          this.porcentajeDescuento = discount;
          return;
        }
      }
    }
  }

  private resolveGallery(producto: Producto): string[] {
    const detailAny = producto as any;
    const galleryFromApi: string[] = Array.isArray(detailAny?.galeriaImagenes)
      ? detailAny.galeriaImagenes
      : Array.isArray(detailAny?.imagenes)
        ? detailAny.imagenes
        : [];

    const images = [
      this.resolveProductImageUrl(producto),
      ...galleryFromApi.map((url) => this.resolveProductImageUrl({
        idProducto: producto.idProducto,
        urlImagen: url
      } as Producto))
    ].filter((url, index, arr) => !!url && arr.indexOf(url) === index);

    if (!images.length) {
      return ['/img/default_product.png'];
    }

    return images;
  }

  private focusInitialElement(): void {
    this.closeButtonRef?.nativeElement?.focus();
  }

  private trapFocus(event: KeyboardEvent): void {
    const panel = this.modalPanelRef?.nativeElement;
    if (!panel) {
      return;
    }

    const focusables = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusables.length) {
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const current = document.activeElement as HTMLElement | null;

    if (event.shiftKey && current === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private resetState(): void {
    this.producto = null;
    this.relatedProducts = [];
    this.precioPromocional = null;
    this.porcentajeDescuento = null;
    this.tienePromocion = false;
    this.galleryImages = [];
    this.selectedImageIndex = 0;
    this.lightboxOpen = false;
    this.cantidad = 1;
    this.feedbackMessage = '';
    this.feedbackType = 'success';
  }

  private resolveProductImageUrl(product: Partial<Producto> & { idProducto?: number }): string {
    const productAny = product as any;
    const rawImage =
      productAny?.urlImagen ??
      productAny?.productoImagen ??
      productAny?.imagen ??
      null;

    const normalizedImage = typeof rawImage === 'string' ? rawImage.replace(/\\/g, '/').trim() : '';

    // Si la API devuelve rutas de storage interno (/images/*), usamos endpoint público por id.
    if (product.idProducto && /^(\/?images\/)/i.test(normalizedImage)) {
      return this.inventoryApi.getProductImageUrl(product.idProducto);
    }

    if (normalizedImage) {
      return this.inventoryApi.resolveImageUrl(normalizedImage);
    }

    if (product.idProducto) {
      return this.inventoryApi.getProductImageUrl(product.idProducto);
    }

    return '/img/default_product.png';
  }
}
