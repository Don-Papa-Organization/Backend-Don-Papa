import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersRoutingModule } from './users-routing-module';
import { Main } from './main/main';
import { AgregarEmployeeForm } from './components/agregar-employee-form/agregar-employee-form';
import { ActualizarEmployeeForm } from './components/actualizar-employee-form/actualizar-employee-form';
import { LayoutModule } from '../../../../shared/layout/layout-module';
import { SharedModule } from '../../../../shared/shared-module';

@NgModule({
  declarations: [
    Main,
    AgregarEmployeeForm,
    ActualizarEmployeeForm
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
