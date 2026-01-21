// import { HttpInterceptorFn } from '@angular/common/http';
// import { SKIP_AUTH } from '../http/http-context';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//     if (req.context.get(SKIP_AUTH) === true) {
//         return next(req);
//     }

//     const mockToken = 'soy-un-token-falso-para-el-mock';

//     const authReq = req.clone({
//         setHeaders: {
//             Authorization: `Bearer ${mockToken}`
//         }
//     });

//     return next(authReq);
// };

// import { HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { OAuthService } from 'angular-oauth2-oidc';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//     const oauthService = inject(OAuthService);

//     // 1. Verificamos si tenemos un token válido en la mano
//     if (oauthService.hasValidAccessToken()) {

//         // 2. Obtenemos el token
//         const token = oauthService.getAccessToken();

//         // 3. Clonamos la petición y le pegamos la cabecera Authorization
//         const authReq = req.clone({
//             headers: req.headers.set('Authorization', `Bearer ${token}`)
//         });

//         // 4. Enviamos la petición modificada
//         return next(authReq);
//     }

//     // Si no hay token, mandamos la petición tal cual (el backend probablemente dará error,
//     // pero el Guard ya se encargó de proteger las rutas)
//     return next(req);
// };

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const oauthService = inject(OAuthService);

    // 0. EXCEPCIÓN CRUCIAL:
    // Si la petición es para pedir o refrescar el token (/oauth2/token),
    // NO debemos inyectar el token actual, porque el backend se confunde 
    // (recibe credenciales del body y del header al mismo tiempo).
    if (req.url.includes('/oauth2/token')) {
        return next(req);
    }

    // 1. Verificamos si tenemos un token válido en la mano
    if (oauthService.hasValidAccessToken()) {

        // 2. Obtenemos el token
        const token = oauthService.getAccessToken();

        // 3. Clonamos la petición y le pegamos la cabecera Authorization
        const authReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        });

        // 4. Enviamos la petición modificada
        return next(authReq);
    }

    // Si no hay token, mandamos la petición tal cual
    return next(req);
};
// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//     const oauthService = inject(OAuthService);


//     if (req.url.includes('/oauth2/token')) {
//         return next(req);
//     }
//     const tieneToken = oauthService.hasValidAccessToken();

//     if (tieneToken) {
//         const token = oauthService.getAccessToken();

//         const authReq = req.clone({
//             headers: req.headers.set('Authorization', `Bearer ${token}`)
//         });
//         return next(authReq);
//     } else {
//         // LOG DE DEPURACIÓN 4: Si entra aquí, es la causa del 401
//         console.warn('⛔ La petición salió SIN token porque hasValidAccessToken() devolvió false.');
//     }

//     return next(req);
// };
