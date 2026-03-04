import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, filter, map, Observable, switchMap, take } from 'rxjs';
import { selectAuthLoading, selectIsAuthenticated, selectUser } from '../../../../domain/auth/state/auth.selectors';
import * as AuthActions from '../../../../domain/auth/state/auth.actions';

@Injectable({ providedIn: 'root' })
export class StatisticsGuard implements CanActivate {
  constructor(private store: Store, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return combineLatest([
      this.store.select(selectAuthLoading),
      this.store.select(selectIsAuthenticated)
    ]).pipe(
      take(1),
      switchMap(([loading, isAuthenticated]) => {
        if (!loading && !isAuthenticated) {
          this.store.dispatch(AuthActions.loadProfile());
        }

        return combineLatest([
          this.store.select(selectAuthLoading),
          this.store.select(selectIsAuthenticated),
          this.store.select(selectUser)
        ]).pipe(
          filter(([currentLoading]) => !currentLoading),
          take(1),
          map(([, authenticated, user]) => {
            if (!authenticated || !user) {
              this.router.navigate(['/auth/login']);
              return false;
            }

            if (user.tipoUsuario !== 'administrador') {
              this.router.navigate(['/']);
              return false;
            }

            return true;
          })
        );
      })
    );
  }
}
