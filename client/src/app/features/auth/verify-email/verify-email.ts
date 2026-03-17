import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Subject, takeUntil } from "rxjs";
import * as AuthActions from "../../../domain/auth/state/auth.actions";
import { selectAuthError, selectAuthLoading, selectAuthMessage } from "../../../domain/auth/state/auth.selectors";

@Component({
  selector: "app-verify-email",
  standalone: false,
  templateUrl: "./verify-email.html",
  styleUrl: "./verify-email.scss"
})
export class VerifyEmail implements OnInit, OnDestroy {
  token = "";
  loading$;
  error$;
  successMessage = "";
  localError = "";
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
        this.localError = "Token de verificación inválido o faltante.";
        return;
      }

      this.localError = "";
      this.successMessage = "";

      this.store.dispatch(
        AuthActions.verifyEmail({
          payload: {
            token: this.token
          }
        })
      );
    });
  }

  ngOnDestroy(): void {
    if (this.redirectTimeoutId) {
      clearTimeout(this.redirectTimeoutId);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToLogin(): void {
    this.router.navigate(["/auth/login"]);
  }
}
