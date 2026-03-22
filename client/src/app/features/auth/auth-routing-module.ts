import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { ForgotPassword } from './forgot-password/forgot-password';
import { ResetPassword } from './reset-password/reset-password';
import { VerifyEmail } from './verify-email/verify-email';
import { guestGuard } from '../../core/guards/guest.guard';

const routes: Routes = [
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    component: Register,
    canActivate: [guestGuard]
  },
  {
    path: 'forgot-password',
    component: ForgotPassword,
    canActivate: [guestGuard]
  },
  {
    path: 'reset-password',
    component: ResetPassword,
    canActivate: [guestGuard]
  },
  {
    path: 'verify-email',
    component: VerifyEmail,
    canActivate: [guestGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
