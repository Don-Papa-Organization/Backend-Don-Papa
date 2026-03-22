import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayout } from './main-layout/main-layout';

const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'catalogo'
      },
      {
        path: 'catalogo',
        loadChildren: () => import('./pages/catalogo/catalogo-module').then(m => m.CatalogoModule)
      },
      {
        path: 'perfil',
        loadChildren: () => import('./pages/perfil/perfil-module').then(m => m.PerfilModule)
      },
      {
        path: 'pedidos',
        loadChildren: () => import('./pages/pedidos/pedidos-module').then(m => m.PedidosModule)
      },
      {
        path: 'pagos',
        loadChildren: () => import('./pages/pedidos/pedidos-module').then(m => m.PedidosModule)
      },
      {
        path: 'carrito',
        loadChildren: () => import('./pages/carrito/carrito-module').then(m => m.CarritoModule)
      },
      {
        path: 'reservas',
        loadChildren: () => import('./pages/reservas/reservas-module').then(m => m.ReservasModule)
      },
      {
        path: 'eventos',
        loadChildren: () => import('./pages/eventos/eventos-module').then(m => m.EventosModule)
      },
      {
        path: '**',
        redirectTo: 'catalogo'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule { }
