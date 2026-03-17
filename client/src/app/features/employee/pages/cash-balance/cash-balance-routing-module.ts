import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CashBalancePageComponent } from './cash-balance-page/cash-balance-page';

const routes: Routes = [
  { path: '', component: CashBalancePageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CashBalanceRoutingModule { }
