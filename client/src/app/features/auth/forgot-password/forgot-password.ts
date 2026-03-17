import { Component, OnDestroy, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Subject, takeUntil } from "rxjs";
import * as AuthActions from "../../../domain/auth/state/auth.actions";
import { selectAuthError, selectAuthLoading, selectAuthMessage } from "../../../domain/auth/state/auth.selectors";
import { NgForm } from "@angular/forms";

@Component({
  selector: "app-forgot-password",
  standalone: false,
  templateUrl: "./forgot-password.html",
  styleUrl: "./forgot-password.scss"
})
export class ForgotPassword implements OnInit, OnDestroy {
  email = "";
  loading$;
  error$;
  successMessage = "";

  private destroy$ = new Subject<void>();

  constructor(private store: Store) {
    this.loading$ = this.store.select(selectAuthLoading);
    this.error$ = this.store.select(selectAuthError);
    this.store
      .select(selectAuthMessage)
      .pipe(takeUntil(this.destroy$))
      .subscribe((message) => {
        if (message) {
          this.successMessage = message;
        }
      });
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
    if (form.invalid || !this.email) {
      return;
    }

    this.successMessage = "";

    this.store.dispatch(
      AuthActions.forgotPassword({
        payload: {
          correo: this.email.trim()
        }
      })
    );
  }
}
