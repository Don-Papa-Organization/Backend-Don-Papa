import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing-module';
import { MainLayout } from './main-layout/main-layout';
import { LayoutModule } from "../../shared/layout/layout-module";
import { SharedModule } from "../../shared/shared-module";


@NgModule({
  declarations: [
    MainLayout
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    LayoutModule,
    SharedModule
]
})
export class AdminModule { }
