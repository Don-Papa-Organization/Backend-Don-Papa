import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, Subject, take } from 'rxjs';
import * as AuthActions from '../../../domain/auth/state/auth.actions';
import { selectAuthError, selectAuthLoading, selectEmailExists } from '../../../domain/auth/state/auth.selectors';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register implements OnInit, OnDestroy {
  email = '';
  password = '';
  passwordConfirmation = '';
  loading$: any;
  error$: any;
  successMessage = '';
  passwordMismatch = false;
  submitted = false;
  emailExistsMessage = '';
  
  private destroy$ = new Subject<void>();
  
  constructor(private store: Store) {
    this.loading$ = this.store.select(selectAuthLoading);
    this.error$ = this.store.select(selectAuthError);
  }

  ngOnInit(): void {
    // Limpiar mensajes previos al inicializar el componente
    this.store.dispatch(AuthActions.clearAuthMessages());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submit(form: NgForm): void {
    this.submitted = true;
    this.passwordMismatch = this.password !== this.passwordConfirmation;
    this.successMessage = '';
    this.emailExistsMessage = '';

    if (form.invalid || !this.email || !this.password || this.passwordMismatch) {
      return;
    }

    const correo = this.email.trim();

    this.store.dispatch(AuthActions.checkEmail({ email: correo }));

    this.store
      .select(selectEmailExists)
      .pipe(
        filter((exists) => exists !== undefined),
        take(1)
      )
      .subscribe((exists) => {
        if (exists) {
          this.emailExistsMessage = 'El correo ya está registrado.';
          return;
        }

        this.store.dispatch(
          AuthActions.register({
            payload: {
              correo,
              contrasena: this.password
            }
          })
        );

        this.successMessage = 'Registro enviado. Revisa tu correo para verificar tu cuenta.';
      });
  }
}
