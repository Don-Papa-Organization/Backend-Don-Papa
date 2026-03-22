import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Quantity controls for cart items - only + and - buttons
 * No manual input allowed
 */
@Component({
  selector: 'app-ui-quantity-controls',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quantity-controls" [class.quantity-controls--client-premium]="visualTheme === 'client-premium'">
      <button
        type="button"
        class="btn-decrease"
        [disabled]="quantity <= 1 || disabled"
        (click)="decreaseQuantity()"
        aria-label="Disminuir cantidad"
      >
        −
      </button>

      <span class="quantity-display">{{ quantity }}</span>

      <button
        type="button"
        class="btn-increase"
        [disabled]="quantity >= maxQuantity || isMaxReached || disabled"
        [title]="isMaxReached && maxQuantity > 0 ? 'Stock máximo alcanzado' : ''"
        (click)="increaseQuantity()"
        aria-label="Aumentar cantidad"
      >
        +
      </button>
    </div>
  `,
  styleUrl: './ui-quantity-controls.component.scss'
})
export class UiQuantityControlsComponent {
  @Input() quantity: number = 1;
  @Input() maxQuantity: number = 999;
  @Input() disabled: boolean = false;
  @Input() visualTheme: 'default' | 'client-premium' = 'default';

  @Output() quantityChange = new EventEmitter<number>();
  @Output() maxReachedAt = new EventEmitter<void>();

  get isMaxReached(): boolean {
    return this.maxQuantity > 0 && this.quantity >= this.maxQuantity;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantityChange.emit(this.quantity - 1);
    }
  }

  increaseQuantity(): void {
    if (!this.isMaxReached && this.quantity < this.maxQuantity) {
      this.quantityChange.emit(this.quantity + 1);
    }
  }
}
