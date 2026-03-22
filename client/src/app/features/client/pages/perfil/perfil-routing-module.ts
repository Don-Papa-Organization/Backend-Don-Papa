import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPerfilComponent } from './main-perfil/main-perfil.component';

const routes: Routes = [
  {
    path: '',
    component: MainPerfilComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PerfilRoutingModule { }
