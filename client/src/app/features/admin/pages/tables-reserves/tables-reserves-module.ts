import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TablesReservesRoutingModule } from './tables-reserves-routing-module';
import { SharedModule } from '../../../../shared/shared-module';
import { LayoutModule } from '../../../../shared/layout/layout-module';
import { MainTablesReserves } from './main-tables-reserves/main-tables-reserves';
import { AgregarMesaForm } from './components/agregar-mesa-form/agregar-mesa-form';
import { EditarMesaForm } from './components/editar-mesa-form/editar-mesa-form';

@NgModule({
  declarations: [
    MainTablesReserves,
    AgregarMesaForm,
    EditarMesaForm
  ],
  imports: [
    CommonModule,
    SharedModule,
    LayoutModule,
    FormsModule,
    TablesReservesRoutingModule
  ]
})
export class TablesReservesModule { }
