import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidosWebRoutingModule } from './pedidos-web-routing.module';
import { PedidosWebPageComponent } from './pedidos-web-page.component';
import { SharedModule } from '../../../../shared/shared-module';
import { LayoutModule } from '../../../../shared/layout/layout-module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    PedidosWebRoutingModule,
    SharedModule,
    LayoutModule,
    PedidosWebPageComponent
  ]
})
export class PedidosWebModule { }
