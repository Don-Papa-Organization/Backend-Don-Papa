import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainEventsPromotions } from './main-events-promotions/main-events-promotions';

const routes: Routes = [
	{
		path: '',
		component: MainEventsPromotions
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventsPromotionsRoutingModule { }
