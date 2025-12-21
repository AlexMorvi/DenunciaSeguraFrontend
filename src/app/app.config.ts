import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { ApiModule as AuditoriaApi } from './core/api/auditoria/api.module';
import { ApiModule as AuthApi } from './core/api/auth/api.module';
import { ApiModule as DenunciasApi } from './core/api/denuncias/api.module';
import { ApiModule as EvidenciasApi } from './core/api/evidencias/api.module';
import { ApiModule as NotificacionesApi } from './core/api/notificaciones/api.module';
import { environment } from '@/environments/environment';
import { authInterceptor } from '@/app/core/http/auth.interceptor';
import { mockStorageInterceptor } from '@/app/core/http/mock-storage.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideHttpClient(
            withFetch(),
            withInterceptors([mockStorageInterceptor, authInterceptor])
        ),
        importProvidersFrom(
            AuditoriaApi.forRoot({ rootUrl: environment.apiAuditoriaUrl! }),
            AuthApi.forRoot({ rootUrl: environment.apiAuthUrl! }),
            DenunciasApi.forRoot({ rootUrl: environment.apiDenunciasUrl! }),
            EvidenciasApi.forRoot({ rootUrl: environment.apiEvidenciasUrl! }),
            NotificacionesApi.forRoot({ rootUrl: environment.apiNotificacionesUrl! })
        )
    ],
};
