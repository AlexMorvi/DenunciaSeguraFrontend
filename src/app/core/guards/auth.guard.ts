import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router'; // Usamos CanActivateFn, es más estándar para seguridad
import { AuthFacade } from '@/data/services/auth.facade';
import { UsuariosFacade } from '@/data/services/usuarios.facade';

export const authGuard: CanActivateFn = async (_route, _state) => {
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
