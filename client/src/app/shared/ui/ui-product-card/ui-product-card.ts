import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Producto } from '../../../domain/inventory/models/producto.model';

export type ProductVariant = 'default' | 'client-premium' | 'featured' | 'horizontal' | 'compact';

@Component({
  selector: 'app-ui-product-card',
  standalone: false,
  templateUrl: './ui-product-card.html',
  styleUrl: './ui-product-card.scss'
})
export class UiProductCard {
  @Input() idProducto: number = 0;
  @Input() nombre: string = 'nombre';
  @Input() precio: number = 0;
  @Input() precioPromocional: number | null = null;
  @Input() porcentajeDescuento: number | null = null;
  @Input() tienePromocion: boolean = false;
  @Input() urlImagen: string = '/img/default_product.png';
  @Input() idCategoria: number = 0;
  @Input() nombreCategoria?: string;
  @Input() stockActual: number = 0;
  @Input() rating?: number;
  @Input() esNuevo?: boolean;
  @Input() esFeatured?: boolean;
  @Input() link: string = '';
  @Input() visualVariant: ProductVariant = 'default';
  @Input() loading: boolean = false;
  @Input() inCart: boolean = false;

  @Output() cardClick = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<Producto>();
  @Output() quickView = new EventEmitter<Producto>();
  @Output() toggleWishlist = new EventEmitter<Producto>();

  onCardClick(): void {
    if (this.loading) {
      return;
    }

    this.cardClick.emit();
  }

  onAddToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.loading || this.isOutOfStock) {
      return;
    }

    this.addToCart.emit(this.buildProductPayload());
  }

  onQuickView(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.loading) {
      return;
    }

    this.quickView.emit(this.buildProductPayload());
  }

  onToggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.loading) {
      return;
    }

    this.toggleWishlist.emit(this.buildProductPayload());
  }

  get isOutOfStock(): boolean {
    return this.stockActual <= 0;
  }

  private buildProductPayload(): Producto {
    return {
      idProducto: this.idProducto,
      nombre: this.nombre,
      precio: this.precio,
      stockActual: this.stockActual,
      stockMinimo: 0,
      activo: !this.isOutOfStock,
      urlImagen: this.urlImagen,
      idCategoria: this.idCategoria
    };
  }
}
