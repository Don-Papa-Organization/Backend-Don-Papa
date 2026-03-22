import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductoPedidoItem } from '../../../domain/orders/models/pedido.model';
import { UiQuantityControlsComponent } from '../ui-quantity-controls/ui-quantity-controls.component';
import { SharedModule } from '../../shared-module';

@Component({
  selector: 'app-ui-cart-item',
  standalone: true,
  imports: [CommonModule, SharedModule, UiQuantityControlsComponent],
  template: `
    <article class="cart-item" [class.cart-item--blocked]="isBlocked" [class.cart-item--client-premium]="visualTheme === 'client-premium'">
      <div class="cart-item__image">
        <img 
          [src]="resolvedImageUrl" 
          [alt]="item.productoNombre || 'Producto'" 
          class="product-image"
          (error)="onImageError()"
        />
      </div>

      <div class="cart-item__content">
        <h3 class="product-name">{{ item.productoNombre || 'Producto #' + item.idProducto }}</h3>
        <p class="product-price">Precio unitario: <strong>{{ formatoMoneda(item.precioUnitario) }}</strong></p>
        
        <div class="quantity-section">
          <app-ui-quantity-controls
            [quantity]="item.cantidad"
            [maxQuantity]="maxQuantity"
            [disabled]="isBlocked"
            [visualTheme]="visualTheme"
            (quantityChange)="onQuantityChange($event)"
            (maxReachedAt)="onMaxReached()"
          ></app-ui-quantity-controls>

          <div class="subtotal">
            <span>Subtotal:</span>
            <strong>{{ formatoMoneda(item.subtotal) }}</strong>
          </div>
        </div>

        <div class="blocked-message" *ngIf="isBlocked && blockedReason">
          <p class="warning-text" [title]="blockedReason">
            {{ blockedReason }}
          </p>
        </div>
      </div>

      <div class="cart-item__actions">
        <ui-button
          texto="×"
          variant="danger"
          [visualTheme]="visualTheme"
          [noBackgroundColor]="true"
          [disabled]="isRemoving"
          (accion)="onRemoveClick()"
          class="btn-remove"
        ></ui-button>

        <span class="badge badge--blocked" *ngIf="isBlocked">BLOQUEADO</span>
      </div>
    </article>
  `,
  styleUrl: './cart-item.component.scss'
})
export class UiCartItemComponent {
  @Input() item!: ProductoPedidoItem;
  @Input() imageUrl: string = '';
  @Input() maxQuantity: number = 0;
  @Input() isBlocked: boolean = false;
  @Input() blockedReason: string = '';
  @Input() isRemoving: boolean = false;
  @Input() visualTheme: 'default' | 'client-premium' = 'default';

  @Output() quantityChange = new EventEmitter<number>();
  @Output() remove = new EventEmitter<void>();
  @Output() maxReached = new EventEmitter<void>();

  private imageErrored = false;

  get resolvedImageUrl(): string {
    if (this.imageErrored || !this.imageUrl) {
      return '/img/default_product.png';
    }

    return this.imageUrl;
  }

  onQuantityChange(quantity: number): void {
    this.quantityChange.emit(quantity);
  }

  onRemoveClick(): void {
    this.remove.emit();
  }

  onMaxReached(): void {
    this.maxReached.emit();
  }

  onImageError(): void {
    this.imageErrored = true;
  }

  formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor || 0);
  }
}
