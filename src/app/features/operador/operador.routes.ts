import { Routes } from '@angular/router';
import { MainLayoutComponent } from '@/core/layout/main-layout/main-layout.component';
import { APP_ROUTES } from '@/core/config/app-routes.config';

export const OPERADOR_ROUTES: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            {
                path: APP_ROUTES.DASHBOARD,
                loadComponent: () => import('@/features/dashboard/views/dashboard.page')
                    .then(m => m.CiudadanoDashboardPage)
            },
            {
                path: `${APP_ROUTES.DENUNCIAS}/:id`,
                loadComponent: () => import('@/features/denuncia/views/denuncia.page')
                    .then(m => m.DenunciaPageComponent)
            },
            {
                path: APP_ROUTES.DENUNCIAS,
                children: [
                    {
                        path: ':id',
                        loadComponent: () => import('@/features/denuncia/views/denuncia.page')
                            .then(m => m.DenunciaPageComponent)
                    }]
            },
            {
                path: APP_ROUTES.PERFIL,
                loadComponent: () => import('@/features/perfil/perfil.page')
                    .then(m => m.PerfilPageComponent)
            },
        ]
    }
];
