import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainReports } from './main-reports/main-reports';

const routes: Routes = [
  {
    path: '',
    component: MainReports
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
