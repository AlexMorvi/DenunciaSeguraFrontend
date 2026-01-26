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
import { stripTrailingSlashInterceptor } from './core/http/strip-slash.interceptor';

// Configuración de Auth con tus parches temporales
const authCodeFlowConfig: AuthConfig = {
    issuer: environment.authIssuer,
    redirectUri: globalThis.location.origin + '/dashboard',
    clientId: 'ds-web',
    scope: 'openid profile',
    responseType: 'code',
    showDebugInformation: environment.showDebugInformation,
    requireHttps: environment.requireHttps,

    // ✅ TUS PARCHES (Mantener mientras arreglas el backend)
    strictDiscoveryDocumentValidation: false,
    skipIssuerCheck: true,
    clockSkewInSec: 30,
};

// Función de inicialización
function initializeApp(
    oauthService: OAuthService,
    usuariosFacade: UsuariosFacade,
    authFacade: AuthFacade
) {
    return async () => {
        // 1. Configurar
        oauthService.configure(authCodeFlowConfig);

        // 2. Setup refresh
        oauthService.setupAutomaticSilentRefresh();

        // 3. Intentar Login
        try {
            const isLoggedIn = await oauthService.loadDiscoveryDocumentAndTryLogin();

            if (isLoggedIn || oauthService.hasValidAccessToken()) {
                try {
                    const user = await usuariosFacade.getProfile();
                    authFacade.updateAuthState(user);
                } catch {
                    // Ignorar error de carga de perfil
                }
            }
        } catch {
            // Manejo silencioso de errores de inicialización de Auth
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

        // ✅ CORREGIDO: Configuración del Resource Server aquí dentro
        provideOAuthClient({
            resourceServer: {
                allowedUrls: [
                    'https://gateway.orangestone-4ddca4b7.eastus2.azurecontainerapps.io',
                    // Agrega tu localhost si estás probando local
                    'http://localhost:8081'
                ],
                sendAccessToken: true
            }
        }),

        provideHttpClient(
            withFetch(),
            withInterceptors([authInterceptor, errorInterceptor, stripTrailingSlashInterceptor,])
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
