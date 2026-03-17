import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CashBalanceRoutingModule } from './cash-balance-routing-module';
import { SharedModule } from '../../../../shared/shared-module';
import { LayoutModule } from '../../../../shared/layout/layout-module';
import { CashBalancePageComponent } from './cash-balance-page/cash-balance-page';

@NgModule({
  declarations: [
    CashBalancePageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CashBalanceRoutingModule,
    SharedModule,
    LayoutModule
  ]
})
export class CashBalanceModule { }
