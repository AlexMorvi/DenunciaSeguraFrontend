import { ApplicationConfig, provideAppInitializer, inject } from '@angular/core';
import { provideRouter, withViewTransitions, PreloadAllModules, withPreloading, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { environment } from '@/../environments/environment';
import { authInterceptor } from '@/core/http/auth.interceptor';
import { errorInterceptor } from '@/core/interceptors/error.interceptor';
import { provideOAuthClient, AuthConfig, OAuthService } from 'angular-oauth2-oidc';

import { ApiConfiguration as AuthConf } from '@/core/api/auth/api-configuration';
import { ApiConfiguration as DenunciasConf } from '@/core/api/denuncias/api-configuration';
import { ApiConfiguration as UsuariosConf } from '@/core/api/usuarios/api-configuration';
import { ApiConfiguration as EvidenciasConf } from '@/core/api/evidencias/api-configuration';

import { UsuariosFacade } from '@/data/services/usuarios.facade';
import { AuthFacade } from '@/data/services/auth.facade';

const authCodeFlowConfig: AuthConfig = {
    issuer: 'http://localhost:9092',

    redirectUri: 'http://localhost:4200/dashboard',

    clientId: 'ds-web',

    scope: 'openid profile',

    responseType: 'code',
    showDebugInformation: true,
    requireHttps: false, // false porque estás en localhost (http)
    strictDiscoveryDocumentValidation: false, // A veces necesario en dev local
};

function initializeApp(
    oauthService: OAuthService,
    usuariosFacade: UsuariosFacade,
    authFacade: AuthFacade
) {
    return async () => {
        oauthService.configure(authCodeFlowConfig);
        oauthService.setupAutomaticSilentRefresh();
        const isLoggedIn = await oauthService.loadDiscoveryDocumentAndTryLogin();

        if (isLoggedIn || oauthService.hasValidAccessToken()) {
            console.log('✅ User is logged in (or has valid token), fetching profile...');
            try {
                const user = await usuariosFacade.getProfile();
                console.log('✅ User profile fetched successfully');
                authFacade.updateAuthState(user);
            } catch (error) {
                console.error('Error initializing user session:', error);
            }
        } else {
            console.log('ℹ️ User is NOT logged in or has expired token');
        }
    };
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(
            routes,
            withViewTransitions(),
            withPreloading(PreloadAllModules),
            withComponentInputBinding()
        ),
        provideOAuthClient(),
        provideHttpClient(
            withFetch(),
            withInterceptors([authInterceptor, errorInterceptor])
        ),

        provideAppInitializer(() => {
            const authConfig = inject(AuthConf);
            authConfig.rootUrl = `${environment.apiUrl}/api/v1/auth`;

            const denunciasConfig = inject(DenunciasConf);
            denunciasConfig.rootUrl = `${environment.apiUrl}/api/denuncias`;

            const usuariosConfig = inject(UsuariosConf);
            usuariosConfig.rootUrl = `${environment.apiUrl}`;

            const evidenciasConfig = inject(EvidenciasConf);
            evidenciasConfig.rootUrl = `${environment.apiUrl}`;

            const oauthService = inject(OAuthService);
            const usuariosFacade = inject(UsuariosFacade);
            const authFacade = inject(AuthFacade);

            return initializeApp(oauthService, usuariosFacade, authFacade)();
        })
    ],
};
