import { Routes } from '@angular/router';
import { MainLayoutComponent } from '@/core/layout/main-layout/main-layout.component';

export const OPERADOR_ROUTES: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

            // {
            //     path: 'dashboard',
            //     loadComponent: () => import('@/features/dashboard/views/supervisor-dashboard/dashboard.page')
            //         .then(m => m.SupervisorDashboardPage)
            // },
            {
                path: 'denuncias/:id',
                loadComponent: () => import('@/features/denuncia/views/denuncia.page')
                    .then(m => m.DenunciaPageComponent)
            },
            // {
            //     path: 'notifications',
            //     loadComponent: () => import('@/features/notification/views/notifications-page/notifications.page')
            //         .then(m => m.NotificationsPage)
            // },
        ]
    }
];
