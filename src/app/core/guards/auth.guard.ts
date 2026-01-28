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
import { CanActivateFn, Router } from '@angular/router'; // Usamos CanActivateFn, es más estándar para seguridad
import { OAuthService } from 'angular-oauth2-oidc';
import { AuthFacade } from '@/data/services/auth.facade';
import { UsuariosFacade } from '@/data/services/usuarios.facade';

export const authGuard: CanActivateFn = async (_route, _state) => {
    const oauthService = inject(OAuthService);
    const authFacade = inject(AuthFacade);
    const usuariosFacade = inject(UsuariosFacade);
    const router = inject(Router);

    // 1. Si ya tenemos usuario en estado, dejamos pasar
    if (authFacade.currentUser()) {
        return true;
    }

    // 2. Intentar obtener el perfil usando las cookies (gateway añade Authorization)
    try {
        const user = await usuariosFacade.getProfile();
        authFacade.updateAuthState(user);
        return true;
    } catch {
        // 3. Si falla (401), mandamos a la página de login (el botón inicia el flujo OIDC)
        return router.createUrlTree(['/login']);
    }
};
