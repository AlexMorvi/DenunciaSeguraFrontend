import { inject } from '@angular/core';
import { CanMatchFn, Route, UrlSegment } from '@angular/router';
import { AuthFacade } from '@/data/services/auth.facade';

export const roleMatchGuard = (allowedRole: string): CanMatchFn => {
    return (_route: Route, _segments: UrlSegment[]) => {

        const authFacade = inject(AuthFacade);
        const user = authFacade.currentUser();

        // TODO: Reemplazar esta línea por la verificación real del rol
        // return user?.rol === allowedRole;
        return 'ADMIN_PLATAFORMA' === allowedRole;
        // return 'CIUDADANO' === allowedRole;
        // return 'SUPERVISOR_DENUNCIAS' === allowedRole;
        // return 'JEFE_INTERNO' === allowedRole;
        // return 'SUPERVISOR_DENUNCIAS' === allowedRole;
    };
};
