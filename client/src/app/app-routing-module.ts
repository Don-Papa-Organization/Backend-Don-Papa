import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { TipoUsuario } from './types/tipo.usuario';

const routes: Routes = [
  {
    path: "",
    loadChildren: () => import('./features/features-module').then(m => m.FeaturesModule)
  },
  {
    path: "auth",
    loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin-module').then(m => m.AdminModule),
    canActivate: [authGuard, roleGuard],
    data: { roles: [TipoUsuario.administrador] }
  },
  {
    path: 'client',
    loadChildren: () => import('./features/client/client-module').then(m => m.ClientModule),
    canActivate: [authGuard, roleGuard],
    data: { roles: [TipoUsuario.cliente] }
  },
  {
    path: 'employee',
    loadChildren: () => import('./features/employee/employee-module').then(m => m.EmployeeModule),
    canActivate: [authGuard, roleGuard],
    data: { roles: [TipoUsuario.empleado] }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
