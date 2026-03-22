import { Component } from '@angular/core';
import { OrdersCartPage } from '../../pedidos/components/orders/cart/orders-cart.page';

@Component({
  selector: 'app-main-carrito',
  standalone: true,
  imports: [OrdersCartPage],
  templateUrl: './main-carrito.component.html',
  styleUrl: './main-carrito.component.scss'
})
export class MainCarritoComponent {}
