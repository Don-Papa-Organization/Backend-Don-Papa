import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared-module';
import { LayoutModule } from '../../../shared/layout/layout-module';

import { PagesRoutingModule } from './pages-routing-module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PagesRoutingModule,
    SharedModule,
    LayoutModule,
    FormsModule
  ]
})
export class PagesModule { }
