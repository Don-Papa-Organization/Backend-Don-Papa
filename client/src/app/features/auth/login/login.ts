import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import * as AuthActions from '../../../domain/auth/state/auth.actions';
import { selectAuthError, selectAuthLoading, selectAuthMessage, selectIsAuthenticated, selectUser } from '../../../domain/auth/state/auth.selectors';
import { TipoUsuario } from '../../../types/tipo.usuario';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit, OnDestroy {
  email = '';
  password = '';
  loading$: any;
  error$: any;
  message$: any;
  successMessage = '';
  private lastLoginEmail = '';
  private autoResendTriggered = false;
  private returnUrl = '';
  
  private destroy$ = new Subject<void>();
  
  constructor(private store: Store, private router: Router, private route: ActivatedRoute) {
    this.loading$ = this.store.select(selectAuthLoading);
    this.error$ = this.store.select(selectAuthError);
    this.message$ = this.store.select(selectAuthMessage);
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '';

    // Limpiar mensajes previos al inicializar el componente
    this.store.dispatch(AuthActions.clearAuthMessages());
    
    combineLatest([
      this.store.select(selectIsAuthenticated),
      this.store.select(selectUser)
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([isAuthenticated, user]) => {
        if (!isAuthenticated || !user) {
          return;
        }

        this.successMessage = 'Inicio de sesión exitoso.';
        this.navigateByRole(user.tipoUsuario);
      });

    this.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error: string | undefined) => {
        if (!error || !this.lastLoginEmail || this.autoResendTriggered) {
          return;
        }

        if (!this.isUnverifiedEmailError(error)) {
          return;
        }

        this.autoResendTriggered = true;
        this.successMessage = 'Tu correo no está verificado. Reenviando enlace de verificación...';

        this.store.dispatch(
          AuthActions.resendVerification({
            payload: { correo: this.lastLoginEmail }
          })
        );
      });

    this.message$
      .pipe(takeUntil(this.destroy$))
      .subscribe((message: string | undefined) => {
        if (!this.autoResendTriggered || !message) {
          return;
        }

        this.successMessage = message;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submit(form: NgForm): void {
    if (form.invalid || !this.email || !this.password) {
      return;
    }

    this.lastLoginEmail = this.email.trim();
    this.autoResendTriggered = false;
    this.successMessage = '';

    this.store.dispatch(
      AuthActions.login({
        payload: {
          correo: this.lastLoginEmail,
          contrasena: this.password
        }
      })
    );
  }

  private isUnverifiedEmailError(error: string): boolean {
    const normalizedError = error.toLowerCase();
    return (
      normalizedError.includes('no esta verificado') ||
      normalizedError.includes('no está verificado') ||
      normalizedError.includes('not verified')
    );
  }

  private navigateByRole(tipoUsuario: TipoUsuario): void {
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }

    switch (tipoUsuario) {
      case TipoUsuario.administrador:
        this.router.navigate(['/admin']);
        break;
      case TipoUsuario.empleado:
        this.router.navigate(['/employee']);
        break;
      case TipoUsuario.cliente:
      default:
        this.router.navigate(['/client']);
        break;
    }
  }

}
