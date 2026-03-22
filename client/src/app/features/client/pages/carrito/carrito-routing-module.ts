import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainCarritoComponent } from './main-carrito/main-carrito.component';

const routes: Routes = [
  {
    path: '',
    component: MainCarritoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CarritoRoutingModule { }
