import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../../../shared/shared-module';
import { LayoutModule } from "../../../../shared/layout/layout-module";
import { FormsModule } from '@angular/forms';
import { InventoryRoutingModule } from './inventory-routing-module';
import { MainInventory } from './main-inventory/main-inventory';
import { AgregarForm } from './components/agregar-form/agregar-form';
import { EditarForm } from './components/editar-form/editar-form';


@NgModule({
  declarations: [
    MainInventory,
    AgregarForm,
    EditarForm
  ],
  imports: [
    CommonModule,
    SharedModule,
    LayoutModule,
    FormsModule,
    InventoryRoutingModule
  ]
})
export class InventoryModule { }
