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

const authCodeFlowConfig: AuthConfig = {
    // Url del servidor de identidad (pregúntale a Ander cual es el 'Issuer')
    issuer: 'http://localhost:9092',

    // URL de tu Angular donde volverá el usuario tras loguearse
    // redirectUri: window.location.origin + '/dashboard',
    redirectUri: 'http://localhost:4200/dashboard',

    // El ID de cliente que Ander configuró en el backend para tu Angular
    clientId: 'ds-web',

    // Permisos que pides (openid profile email offline_access, etc.)
    scope: 'openid profile',

    responseType: 'code',
    showDebugInformation: true,
    requireHttps: false, // false porque estás en localhost (http)
    strictDiscoveryDocumentValidation: false, // A veces necesario en dev local
    // dummyClientSecret: '',

    // Opcional: Asegura que el token endpoint use POST urlencoded
    // (generalmente es el default, pero ayuda ser explícito)
    // oidc: true
};

function initializeOAuth(oauthService: OAuthService) {
    return async () => {
        oauthService.configure(authCodeFlowConfig);
        oauthService.setupAutomaticSilentRefresh();
        await oauthService.loadDiscoveryDocumentAndTryLogin();
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
            usuariosConfig.rootUrl = `${environment.apiUrl}/api/usuarios`;

            const evidenciasConfig = inject(EvidenciasConf);
            evidenciasConfig.rootUrl = `${environment.apiUrl}/api/v1/evidencias`;

            const oauthService = inject(OAuthService);

            return initializeOAuth(oauthService)();
        })
    ],
};
