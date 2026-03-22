import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainEventosComponent } from './main-eventos/main-eventos.component';

const routes: Routes = [
  {
    path: '',
    component: MainEventosComponent
  },
  {
    path: ':idEvento',
    loadComponent: () => import('./components/events-detail/events-detail.page').then(c => c.EventsDetailPage)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventosRoutingModule { }
