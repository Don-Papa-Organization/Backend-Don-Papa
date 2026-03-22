import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { combineLatest, filter, map, take } from "rxjs";
import { Store } from "@ngrx/store";
import { selectAuthLoading, selectIsAuthenticated } from "../../domain/auth/state/auth.selectors";

export const guestGuard: CanActivateFn = (route) => {
	const store = inject(Store);
	const router = inject(Router);

	return combineLatest([
		store.select(selectAuthLoading),
		store.select(selectIsAuthenticated)
	]).pipe(
		filter(([loading]) => !loading),
		take(1),
		map(([, isAuthenticated]) => {
			if (isAuthenticated) {
				const returnUrl = route.queryParamMap.get("returnUrl");
				if (returnUrl && returnUrl.startsWith("/")) {
					return router.parseUrl(returnUrl);
				}
				return router.createUrlTree(["/"]);
			}
			return true;
		})
	);
};
