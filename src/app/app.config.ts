import { ApplicationConfig, provideAppInitializer, inject } from '@angular/core';
import { provideRouter, withViewTransitions, PreloadAllModules, withPreloading, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

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
    issuer: environment.authIssuer,

    redirectUri: globalThis.location.origin + '/dashboard',

    clientId: 'ds-web',
    scope: 'openid profile',
    responseType: 'code',

    showDebugInformation: environment.showDebugInformation,
    requireHttps: environment.requireHttps,
    strictDiscoveryDocumentValidation: false,
    skipIssuerCheck: true,
};

function initializeApp(
    oauthService: OAuthService,
    usuariosFacade: UsuariosFacade,
    authFacade: AuthFacade
) {
    return async () => {
        console.log('[AppConfig] initializeApp: Iniciando configuración...');
        oauthService.configure(authCodeFlowConfig);
        console.log('[AppConfig] initializeApp: OAuth configurado con issuer:', authCodeFlowConfig.issuer);

        oauthService.setupAutomaticSilentRefresh();
        console.log('[AppConfig] initializeApp: setupAutomaticSilentRefresh terminado');
        await oauthService.loadDiscoveryDocumentAndTryLogin();
        // try {
        //     const isLoggedIn = await oauthService.loadDiscoveryDocumentAndTryLogin();
        //     if (isLoggedIn || oauthService.hasValidAccessToken()) {
        //         try {
        //             const user = await usuariosFacade.getProfile();
        //             authFacade.updateAuthState(user);
        //         } catch (e) {
        //             console.warn('Error cargando perfil de usuario', e);
        //         }
        //     }
        // } catch (e) {
        //     console.error('Error conectando con el servidor de identidad (Issuer)', e);
        // }
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
            console.log('[AppConfig] provideAppInitializer: Configurando servicios API...');

            const authConfig = inject(AuthConf);
            authConfig.rootUrl = `${environment.apiUrl}/api/v1/auth`;
            console.log('[AppConfig] Auth API URL:', authConfig.rootUrl);

            const denunciasConfig = inject(DenunciasConf);
            denunciasConfig.rootUrl = `${environment.apiUrl}/api/denuncias`;
            console.log('[AppConfig] Denuncias API URL:', denunciasConfig.rootUrl);

            const usuariosConfig = inject(UsuariosConf);
            usuariosConfig.rootUrl = `${environment.apiUrl}/usuarios`;
            console.log('[AppConfig] Usuarios API URL:', usuariosConfig.rootUrl);

            const evidenciasConfig = inject(EvidenciasConf);
            evidenciasConfig.rootUrl = `${environment.apiUrl}`;
            console.log('[AppConfig] Evidencias API URL:', evidenciasConfig.rootUrl);

            const oauthService = inject(OAuthService);
            const usuariosFacade = inject(UsuariosFacade);
            const authFacade = inject(AuthFacade);

            return initializeApp(oauthService, usuariosFacade, authFacade)();
        })
    ],
};
