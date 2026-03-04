import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainStatistics } from './main-statistics/main-statistics';
import { StatisticsGuard } from './statistics.guard';

const routes: Routes = [
  {
    path: '',
    component: MainStatistics,
    canActivate: [StatisticsGuard],
    data: { title: 'Estadísticas' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StatisticsRoutingModule { }
