import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ui-empty-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="empty-cart">
      <div class="empty-cart__placeholder">
        <svg class="empty-cart__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <p class="empty-text">No hay productos en el carrito, <a [routerLink]="catalogRoute" class="catalog-link">ir al catalogo</a></p>
      </div>
    </div>
  `,
  styleUrl: './empty-cart.component.scss'
})
export class UiEmptyCartComponent {
  @Input() catalogRoute: string = '/client/catalogo';
}
