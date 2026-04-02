import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuessLayout } from './layout/guess-layout';

const routes: Routes = [
  {
    path: '',
    component: GuessLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'catalogo'
      },
      {
        path: 'catalogo',
        loadComponent: () => import('../client/pages/catalogo/components/catalog-marketplace/catalog-marketplace.page').then(c => c.CatalogMarketplacePage),
        data: { marketplaceMode: 'public' }
      },
      {
        path: 'catalogo/:idProducto',
        loadComponent: () => import('../client/pages/catalogo/components/catalog-detail/catalog-detail.page').then(c => c.CatalogDetailPage),
        data: { marketplaceMode: 'public' }
      },
      {
        path: 'reservas',
        loadComponent: () => import('../client/pages/reservas/components/mesas-check-availability/mesas-check-availability.page').then(c => c.MesasCheckAvailabilityPage),
        data: { marketplaceMode: 'public' }
      },
      {
        path: 'eventos',
        loadComponent: () => import('../client/pages/eventos/components/events-list/events-list.page').then(c => c.EventsListPage),
        data: { marketplaceMode: 'public' }
      },
      {
        path: 'eventos/:idEvento',
        loadComponent: () => import('../client/pages/eventos/components/events-detail/events-detail.page').then(c => c.EventsDetailPage),
        data: { marketplaceMode: 'public' }
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
export class GuessRoutingModule { }
