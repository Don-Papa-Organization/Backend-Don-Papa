import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrdersRoutingModule } from './orders-routing-module';
import { MainOrdersComponent } from './main-orders/main-orders';
import { AgregarOrderFormComponent } from './components/agregar-order-form/agregar-order-form';
import { EditarOrderFormComponent } from './components/editar-order-form/editar-order-form';
import { GestionarProductosFormComponent } from './components/gestionar-productos-form/gestionar-productos-form';
import { AgregarMetodoPagoFormComponent } from './components/agregar-metodo-pago-form/agregar-metodo-pago-form';
import { EditarMetodoPagoFormComponent } from './components/editar-metodo-pago-form/editar-metodo-pago-form';
import { RegistrarPagoFormComponent } from './components/registrar-pago-form/registrar-pago-form';
import { PaymentsSectionComponent } from './components/payments-section/payments-section';
import { SharedModule } from '../../../../shared/shared-module';
import { LayoutModule } from '../../../../shared/layout/layout-module';

@NgModule({
	declarations: [
		MainOrdersComponent,
		AgregarOrderFormComponent,
		EditarOrderFormComponent,
		GestionarProductosFormComponent,
		AgregarMetodoPagoFormComponent,
		EditarMetodoPagoFormComponent,
		RegistrarPagoFormComponent,
		PaymentsSectionComponent
	],
	imports: [CommonModule, FormsModule, OrdersRoutingModule, SharedModule, LayoutModule]
})
export class OrdersModule {}
