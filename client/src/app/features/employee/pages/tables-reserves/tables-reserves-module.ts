import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TablesReservesRoutingModule } from './tables-reserves-routing-module';
import { SharedModule } from '../../../../shared/shared-module';
import { LayoutModule } from '../../../../shared/layout/layout-module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    LayoutModule,
    FormsModule,
    TablesReservesRoutingModule
  ]
})
export class TablesReservesModule { }
