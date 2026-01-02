import { Routes } from '@angular/router';
import { MainLayoutComponent } from '@/core/layout/main-layout/main-layout.component';

export const JEFE_ROUTES: Routes = [
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
                path: 'denuncia',
                loadComponent: () => import('@/features/denuncia/views/staff/denuncia.page')
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
