import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

// Envía cookies y, si existe, el access token como Bearer
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const oauthService = inject(OAuthService);

    // Peticiones a Supabase (archivos) no deben llevar credenciales ni Authorization
    if (req.url.includes('supabase.co/storage')) {
        return next(req.clone({ withCredentials: false }));
    }

    // No adjuntamos Authorization en las peticiones de obtención de token
    if (req.url.includes('/oauth2/token') || req.url.includes('/auth/logout')) {
        return next(req.clone({ withCredentials: true }));
    }

    const hasToken = oauthService.hasValidAccessToken();
    const headers = hasToken
        ? req.headers.set('Authorization', `Bearer ${oauthService.getAccessToken()}`)
        : req.headers;

    const reqWithCreds = req.clone({
        withCredentials: true,
        headers
    });

    return next(reqWithCreds);
};
