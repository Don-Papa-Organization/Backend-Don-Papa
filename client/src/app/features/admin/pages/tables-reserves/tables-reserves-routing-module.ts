import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainTablesReserves } from './main-tables-reserves/main-tables-reserves';
import { roleGuard } from '../../../../core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: MainTablesReserves,
    canActivate: [roleGuard],
    data: { requiredRoles: ['ADMIN'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TablesReservesRoutingModule { }
