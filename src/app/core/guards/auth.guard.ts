// import { inject } from '@angular/core';
// import { CanMatchFn, Router } from '@angular/router';
// import { AuthFacade } from '@/data/services/auth.facade';

// export const authGuard: CanMatchFn = (_route, _segments) => {
//     const authFacade = inject(AuthFacade);
//     const router = inject(Router);

//     const isLogged = !!authFacade.currentUser();

//     if (isLogged) {
//         return true;
//     }

//     return router.createUrlTree(['/login']);
// };
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router'; // Usamos CanActivateFn, es más estándar para seguridad
import { OAuthService } from 'angular-oauth2-oidc';

export const authGuard: CanActivateFn = (_route, _state) => {
    const oauthService = inject(OAuthService);

    // 1. Preguntamos directamente: ¿Tienes el pase (token) en la mano?
    // Esto es instantáneo y no depende de peticiones al backend.
    const hasToken = oauthService.hasValidAccessToken();

    if (hasToken) {
        return true; // ¡Adelante!
    }

    // 2. Si no tiene token, NO lo mandamos a una ruta interna.
    // Lo mandamos al viaje hacia el puerto 9092.
    oauthService.initLoginFlow();

    return false; // Bloqueamos la navegación actual mientras se redirige
};
