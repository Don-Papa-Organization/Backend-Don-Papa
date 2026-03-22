import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { SharedModule } from '../../../../../../shared/shared-module';
import { Producto } from '../../../../../../domain/inventory/models/producto.model';
import { EventEmitter, Output, OnDestroy } from '@angular/core';

interface FeaturedProductView extends Producto {
  precioPromocional?: number | null;
  porcentajeDescuento?: number | null;
  tienePromocion?: boolean;
  nombreCategoria?: string;
  esFeatured?: boolean;
  esNuevo?: boolean;
}

@Component({
  selector: 'app-featured-products-row',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './featured-products-row.component.html',
  styleUrl: './featured-products-row.component.scss'
})
export class FeaturedProductsRowComponent implements OnInit {
  @Input() productos: FeaturedProductView[] = [];
  @Input() loading = false;
  @Input() tipoDestacado: 'featured' | 'recent' = 'featured';

  @Output() addToCart = new EventEmitter<Producto>();
  @Output() quickView = new EventEmitter<Producto>();
  @Output() toggleWishlist = new EventEmitter<Producto>();

  displayProducts: FeaturedProductView[] = [];
  rotationIndex = 0;
  private rotationInterval: any;

  ngOnInit(): void {
    this.updateDisplayProducts();
  }

  ngOnChanges(): void {
    this.updateDisplayProducts();
  }

  ngOnDestroy(): void {
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
    }
  }

  private updateDisplayProducts(): void {
    if (this.productos && this.productos.length > 0) {
      this.displayProducts = this.productos.slice(0, 4);
    }
  }

  get titleText(): string {
    return this.tipoDestacado === 'featured' ? 'Destacados' : 'Novedades';
  }

  get subtitleText(): string {
    return this.tipoDestacado === 'featured'
      ? 'Selección premium de nuestros mejores productos'
      : 'Últimos productos agregados al catálogo';
  }

  onAddToCart(producto: Producto): void {
    this.addToCart.emit(producto);
  }

  onQuickView(producto: Producto): void {
    this.quickView.emit(producto);
  }

  onToggleWishlist(producto: Producto): void {
    this.toggleWishlist.emit(producto);
  }

  trackByProductId(index: number, producto: FeaturedProductView): number {
    return producto.idProducto;
  }
}
