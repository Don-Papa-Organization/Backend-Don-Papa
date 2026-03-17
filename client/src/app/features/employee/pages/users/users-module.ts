import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UsersRoutingModule } from './users-routing-module';
import { SharedModule } from '../../../../shared/shared-module';
import { LayoutModule } from '../../../../shared/layout/layout-module';
import { EmployeeProfileComponent } from './profile/profile';

@NgModule({
  declarations: [
    EmployeeProfileComponent
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
    SharedModule,
    LayoutModule,
    FormsModule
  ]
})
export class UsersModule { }
