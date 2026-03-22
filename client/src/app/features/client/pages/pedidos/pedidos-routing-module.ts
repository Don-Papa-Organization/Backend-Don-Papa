import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'pagos/registrar/:idPedido',
    loadComponent: () => import('./components/payments/register/register-payment.page').then(c => c.RegisterPaymentPage)
  },
  {
    path: ':idPedido',
    loadComponent: () => import('./components/orders/detail/order-detail.page').then(c => c.OrderDetailPage)
  },
  {
    path: '**',
    redirectTo: '/client/perfil'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PedidosRoutingModule { }
