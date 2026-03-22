import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainCatalogoComponent } from './main-catalogo/main-catalogo.component';

const routes: Routes = [
  {
    path: '',
    component: MainCatalogoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogoRoutingModule { }
