import { inject } from '@angular/core';
import { CanMatchFn, Route, UrlSegment } from '@angular/router';
import { AuthFacade } from '@/data/services/auth.facade';

export const roleMatchGuard = (...allowedRoles: string[]): CanMatchFn => {
    return (_route: Route, _segments: UrlSegment[]) => {
        const authFacade = inject(AuthFacade);
        const user = authFacade.currentUser();

        console.log('[RoleGuard] Access check:', {
            hasUser: !!user,
            userRole: user?.rol,
            requiredRoles: allowedRoles
        });

        if (!user?.rol) return false;
        return allowedRoles.includes(user.rol);
    };
};
