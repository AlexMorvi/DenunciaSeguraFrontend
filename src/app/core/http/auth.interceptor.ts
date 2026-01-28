import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const oauthService = inject(OAuthService);

    if (req.url.includes('/oauth2/token') || req.url.includes('/auth/logout')) {
        return next(req);
    }

    if (oauthService.hasValidAccessToken()) {

        const token = oauthService.getAccessToken();

        const authReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        });

        return next(authReq);
    }

    return next(req);
};
