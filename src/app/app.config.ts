import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),

        provideHttpClient(
            withInterceptorsFromDi()
        ),
        importProvidersFrom(
            // DenunciasApi.forRoot({ rootUrl: 'https://api.midominio.com/denuncias' }),
            // UsuariosApi.forRoot({ rootUrl: 'https://api.midominio.com/usuarios' }),
            // PagosApi.forRoot({ rootUrl: 'https://api.midominio.com/pagos' })
        )
    ],
};
