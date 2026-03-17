import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrdersRoutingModule } from './orders-routing-module';
import { SharedModule } from '../../../../shared/shared-module';
import { LayoutModule } from '../../../../shared/layout/layout-module';
import { MainOrdersComponent } from './main-orders/main-orders';
import { TableSaleComponent } from './table-sale/table-sale';
import { CategoryProductsComponent } from './category-products/category-products';
import { RegistrarPagoFormComponent } from './components/registrar-pago-form/registrar-pago-form';
import { TableSaleConfigComponent } from './components/table-sale-config/table-sale-config';
import { TableSaleFooterActionsComponent } from './components/table-sale-footer-actions/table-sale-footer-actions';
import { TableSaleOrderLinesComponent } from './components/table-sale-order-lines/table-sale-order-lines';
import { PosFloorPlanComponent } from './pos-floor-plan/pos-floor-plan';

@NgModule({
  declarations: [
    MainOrdersComponent,
    TableSaleComponent,
    CategoryProductsComponent,
    RegistrarPagoFormComponent,
    TableSaleConfigComponent,
    TableSaleFooterActionsComponent,
    TableSaleOrderLinesComponent,
    PosFloorPlanComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    OrdersRoutingModule,
    SharedModule,
    LayoutModule
  ]
})
export class OrdersModule { }
