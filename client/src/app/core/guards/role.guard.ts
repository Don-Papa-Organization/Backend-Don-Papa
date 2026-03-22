import { CanActivateFn, Router, ActivatedRouteSnapshot } from "@angular/router";
import { inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { combineLatest, filter, map, take } from "rxjs";
import { selectAuthLoading, selectIsAuthenticated, selectUser } from "../../domain/auth/state/auth.selectors";
import { TipoUsuario } from "../../types/tipo.usuario";

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
	const store = inject(Store);
	const router = inject(Router);

	const roles = (route.data?.["roles"] as TipoUsuario[] | undefined) ?? [];

	return combineLatest([
		store.select(selectAuthLoading),
		store.select(selectIsAuthenticated),
		store.select(selectUser)
	]).pipe(
		filter(([loading]) => !loading),
		take(1),
		map(([, isAuthenticated, user]) => {
			if (!isAuthenticated || !user) {
				return router.createUrlTree(["/auth/login"], {
					queryParams: { returnUrl: state.url }
				});
			}

			if (roles.length === 0) {
				return true;
			}

			const allowed = roles.includes(user.tipoUsuario);
			if (!allowed) {
				return router.createUrlTree(["/"]);
			}

			return true;
		})
	);
};
