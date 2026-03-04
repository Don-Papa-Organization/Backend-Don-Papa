import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ReportsRoutingModule } from './reports-routing-module';
import { MainReports } from './main-reports/main-reports';
import { SharedModule } from '../../../../shared/shared-module';


@NgModule({
  declarations: [
    MainReports
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReportsRoutingModule,
    SharedModule
  ]
})
export class ReportsModule { }
