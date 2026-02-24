import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainInventory } from './main-inventory/main-inventory';
import { roleGuard } from '../../../../core/guards/role.guard';

const routes: Routes = [
  {
    path: "",
    component: MainInventory,
    canActivate: [roleGuard],
    data: { requiredRoles: ['ADMIN'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
