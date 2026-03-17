import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainOrdersComponent } from './main-orders/main-orders';
import { TableSaleComponent } from './table-sale/table-sale';

const routes: Routes = [
  {
    path: '',
    component: MainOrdersComponent
  },
  {
    path: 'table/:idMesa',
    component: TableSaleComponent
  },
  {
    path: 'table/:idMesa/category/:idCategoria',
    component: TableSaleComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }
