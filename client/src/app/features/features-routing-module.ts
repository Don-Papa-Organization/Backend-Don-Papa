import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CatalogMarketplacePage } from './client/pages/catalogo/components/catalog-marketplace/catalog-marketplace.page';
import { CatalogDetailPage } from './client/pages/catalogo/components/catalog-detail/catalog-detail.page';
import { Catalog } from './catalog/catalog';

const routes: Routes = [
  {
    path: '',
    component: Catalog,
  },
  {
    path: 'catalogo',
    component: CatalogMarketplacePage,
    data: { marketplaceMode: 'public' }
  },
  {
    path: 'catalogo/:idProducto',
    component: CatalogDetailPage,
    data: { marketplaceMode: 'public' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeaturesRoutingModule { }
