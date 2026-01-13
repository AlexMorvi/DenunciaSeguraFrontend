import { inject } from '@angular/core';
import { CanMatchFn, Route, UrlSegment } from '@angular/router';
import { AuthFacade } from '@/data/services/auth.facade';

export const roleMatchGuard = (allowedRole: string): CanMatchFn => {
    return (_route: Route, _segments: UrlSegment[]) => {
        const authFacade = inject(AuthFacade);
        const user = authFacade.currentUser();
        return user?.rol === allowedRole;
    };
};
