import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainOrdersComponent } from './main-orders/main-orders';
import { roleGuard } from '../../../../core/guards/role.guard';

const routes: Routes = [
	{
		path: '',
		component: MainOrdersComponent,
		canActivate: [roleGuard],
		data: { requiredRoles: ['ADMIN'] }
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class OrdersRoutingModule {}
