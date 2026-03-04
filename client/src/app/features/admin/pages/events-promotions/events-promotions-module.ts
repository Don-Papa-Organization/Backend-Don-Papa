import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EventsPromotionsRoutingModule } from './events-promotions-routing-module';
import { SharedModule } from '../../../../shared/shared-module';
import { LayoutModule } from '../../../../shared/layout/layout-module';

import { MainEventsPromotions } from './main-events-promotions/main-events-promotions';
import { AgregarPromotionForm } from './components/agregar-promotion-form/agregar-promotion-form';
import { EditarPromotionForm } from './components/editar-promotion-form/editar-promotion-form';
import { AgregarEventForm } from './components/agregar-event-form/agregar-event-form';
import { EditarEventForm } from './components/editar-event-form/editar-event-form';
import { AgregarProductoForm } from './components/agregar-producto-form/agregar-producto-form';
import { AgregarDiaEventoForm } from './components/agregar-dia-evento-form/agregar-dia-evento-form';
import { EditarProductoForm } from './components/editar-producto-form/editar-producto-form';
import { EditarDiaEventoForm } from './components/editar-dia-evento-form/editar-dia-evento-form';
import { AgregarPromocionDiaEventoForm } from './components/agregar-promocion-dia-evento-form/agregar-promocion-dia-evento-form';
import { ProductsSectionComponent } from './components/products-section/products-section';
import { DaysSectionComponent } from './components/days-section/days-section';

@NgModule({
  declarations: [
    MainEventsPromotions,
    AgregarPromotionForm,
    EditarPromotionForm,
    AgregarEventForm,
    EditarEventForm,
    AgregarProductoForm,
    AgregarDiaEventoForm,
    EditarProductoForm,
    EditarDiaEventoForm,
    AgregarPromocionDiaEventoForm,
    ProductsSectionComponent,
    DaysSectionComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    EventsPromotionsRoutingModule,
    SharedModule,
    LayoutModule
  ]
})
export class EventsPromotionsModule { }
