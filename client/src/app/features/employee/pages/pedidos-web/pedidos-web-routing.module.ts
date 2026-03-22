import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PedidosWebPageComponent } from './pedidos-web-page.component';

const routes: Routes = [
  { path: '', component: PedidosWebPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PedidosWebRoutingModule { }
