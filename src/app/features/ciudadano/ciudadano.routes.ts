import { Routes } from '@angular/router';
import { MainLayoutComponent } from '@/core/layout/main-layout/main-layout.component';

export const CITIZEN_ROUTES: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

            {
                path: 'dashboard',
                loadComponent: () => import('@/features/dashboard/views/ciudadano-dashboard/dashboard.page')
                    .then(m => m.CiudadanoDashboardPage)
            },
            {
                path: 'denuncias/nueva',
                loadComponent: () => import('@/features/create-denuncia/crear-denuncia.page')
                    .then(m => m.CrearDenunciaComponent)
            },
            {
                path: 'denuncias/:id',
                loadComponent: () => import('@/features/denuncia/views/denuncia.page')
                    .then(m => m.DenunciaPageComponent)
            },
            {
                path: 'notifications',
                loadComponent: () => import('@/features/notification/views/notifications-page/notifications.page')
                    .then(m => m.NotificationsPage)
            },
            {
                path: 'perfil',
                loadComponent: () => import('@/features/perfil/perfil.page')
                    .then(m => m.PerfilPageComponent)
            },
        ]
    }
];
