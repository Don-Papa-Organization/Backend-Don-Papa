import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared-module';
import { LayoutModule } from '../../shared/layout/layout-module';

import { GuessRoutingModule } from './guess-routing-module';
import { GuessLayout } from './layout/guess-layout';


@NgModule({
  declarations: [GuessLayout],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    LayoutModule,
    GuessRoutingModule
  ]
})
export class GuessModule { }
