import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Subject, takeUntil } from "rxjs";
import * as AuthActions from "../../../domain/auth/state/auth.actions";
import { selectAuthError, selectAuthLoading, selectAuthMessage } from "../../../domain/auth/state/auth.selectors";
import { NgForm } from "@angular/forms";

@Component({
  selector: "app-reset-password",
  standalone: false,
  templateUrl: "./reset-password.html",
  styleUrl: "./reset-password.scss"
})
export class ResetPassword implements OnInit, OnDestroy {
  token = "";
  nuevaContrasena = "";
  confirmarContrasena = "";
  passwordMismatch = false;
  loading$;
  error$;
  successMessage = "";
  tokenError = "";
  private redirectTimeoutId: ReturnType<typeof setTimeout> | undefined;

  private destroy$ = new Subject<void>();

  constructor(private store: Store, private route: ActivatedRoute, private router: Router) {
    this.loading$ = this.store.select(selectAuthLoading);
    this.error$ = this.store.select(selectAuthError);
    this.store
      .select(selectAuthMessage)
      .pipe(takeUntil(this.destroy$))
      .subscribe((message) => {
        if (message) {
          this.successMessage = message;
          if (this.redirectTimeoutId) {
            clearTimeout(this.redirectTimeoutId);
          }
          this.redirectTimeoutId = setTimeout(() => {
            this.goToLogin();
          }, 1200);
        }
      });
  }

  ngOnInit(): void {
    // Limpiar mensajes previos al inicializar el componente
    this.store.dispatch(AuthActions.clearAuthMessages());
    
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.token = params.get("token") || "";

      if (!this.token) {
        this.tokenError = "El enlace de recuperación es inválido o ha expirado.";
      } else {
        this.tokenError = "";
      }
    });
  }

  ngOnDestroy(): void {
    if (this.redirectTimeoutId) {
      clearTimeout(this.redirectTimeoutId);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  submit(form: NgForm): void {
    this.passwordMismatch = this.nuevaContrasena !== this.confirmarContrasena;

    if (!this.token) {
      this.tokenError = "El enlace de recuperación es inválido o ha expirado.";
    }

    if (form.invalid || !this.token || this.passwordMismatch) {
      return;
    }

    this.successMessage = "";

    this.store.dispatch(
      AuthActions.resetPassword({
        payload: {
          token: this.token,
          nuevaContrasena: this.nuevaContrasena,
          confirmarContrasena: this.confirmarContrasena
        }
      })
    );
  }

  goToLogin(): void {
    this.router.navigate(["/auth/login"]);
  }
}
