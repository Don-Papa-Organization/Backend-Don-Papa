import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { combineLatest, filter, map, switchMap, take } from "rxjs";
import { Store } from "@ngrx/store";
import { selectAuthLoading, selectIsAuthenticated } from "../../domain/auth/state/auth.selectors";
import * as AuthActions from "../../domain/auth/state/auth.actions";

export const authGuard: CanActivateFn = (_route, state) => {
	const store = inject(Store);
	const router = inject(Router);

	return combineLatest([
		store.select(selectAuthLoading),
		store.select(selectIsAuthenticated)
	]).pipe(
		take(1),
		switchMap(([loading, isAuthenticated]) => {
			if (!loading && !isAuthenticated) {
				store.dispatch(AuthActions.loadProfile());
			}

			return combineLatest([
				store.select(selectAuthLoading),
				store.select(selectIsAuthenticated)
			]).pipe(
				filter(([currentLoading]) => !currentLoading),
				take(1),
				map(([, isAuthenticated]) => {
					if (!isAuthenticated) {
							return router.createUrlTree(["/auth/login"], {
								queryParams: { returnUrl: state.url }
							});
					}
					return isAuthenticated;
				})
			);
		})
	);
};
