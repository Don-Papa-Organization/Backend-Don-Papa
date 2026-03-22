import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainReservasComponent } from './main-reservas/main-reservas.component';

const routes: Routes = [
  {
    path: '',
    component: MainReservasComponent
  },
  {
    path: 'disponibilidad',
    loadComponent: () => import('./components/mesas-check-availability/mesas-check-availability.page').then(c => c.MesasCheckAvailabilityPage)
  },
  {
    path: 'confirmar/:idMesa',
    loadComponent: () => import('./components/reserve-table/reserve-table.page').then(c => c.ReserveTablePage)
  },
  {
    path: 'historial',
    loadComponent: () => import('./components/reservation-history/reservation-history.page').then(c => c.ReservationHistoryPage)
  },
  {
    path: 'detalle/:idReserva',
    loadComponent: () => import('./components/reservation-detail/reservation-detail.page').then(c => c.ReservationDetailPage)
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
export class ReservasRoutingModule { }
