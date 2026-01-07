import { Routes } from '@angular/router';
// import { DenunciasResolver } from './denuncias.resolver';
import { MainLayoutComponent } from '@/core/layout/main-layout/main-layout.component';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => import('@/features/dashboard/views/admin-dashboard/dashboard.page')
                    .then(m => m.AdminDashboardPage),
                // resolve: { denunciasLoaded: DenunciasResolver }
            },
            {
                path: 'roles',
                loadComponent: () => import('@/features/roles/staff-manager.page')
                    .then(m => m.StaffManagerPage)
            }
        ]
    }
];
