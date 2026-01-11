import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthFacade } from '@/data/services/auth.facade';

export const authGuard: CanMatchFn = (_route, _segments) => {
    const authFacade = inject(AuthFacade);
    const router = inject(Router);

    const isLogged = !!authFacade.currentUser();

    if (isLogged) {
        return true;
    }

    return router.createUrlTree(['/login']);
};
