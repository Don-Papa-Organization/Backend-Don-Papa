import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeRoutingModule } from './employee-routing-module';
import { MainLayout } from './main-layout/main-layout';
import { LayoutModule } from '../../shared/layout/layout-module';
import { SharedModule } from '../../shared/shared-module';


@NgModule({
  declarations: [
    MainLayout
  ],
  imports: [
    CommonModule,
    EmployeeRoutingModule,
    LayoutModule,
    SharedModule
  ]
})
export class EmployeeModule { }
