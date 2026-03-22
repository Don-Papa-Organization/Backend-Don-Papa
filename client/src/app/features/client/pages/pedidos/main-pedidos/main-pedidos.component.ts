import { Component } from '@angular/core';
import { OrdersConsolidatedPage } from '../components/orders/list/orders-consolidated.page';

@Component({
  selector: 'app-main-pedidos',
  standalone: true,
  imports: [OrdersConsolidatedPage],
  templateUrl: './main-pedidos.component.html',
  styleUrl: './main-pedidos.component.scss'
})
export class MainPedidosComponent {}
