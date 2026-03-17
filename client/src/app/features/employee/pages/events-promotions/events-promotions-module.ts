import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EventsPromotionsRoutingModule } from './events-promotions-routing-module';
import { SharedModule } from '../../../../shared/shared-module';
import { LayoutModule } from '../../../../shared/layout/layout-module';
import { EventsPageComponent } from './events-page/events-page';

@NgModule({
  declarations: [
    EventsPageComponent
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
