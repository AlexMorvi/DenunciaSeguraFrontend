import { Routes } from '@angular/router';
// import { authGuard } from './core/auth/guards/auth.guard'; // 1. Importa tus guards
// import { roleGuard } from './core/auth/guards/role.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'auth/login', // 2. Corrección: Apunta a la ruta real de login
        pathMatch: 'full'
    },
    {
        path: 'auth',
        loadChildren: () => import('./features/dashboard/routes/auth.routes').then(m => m.AUTH_ROUTES)
    },
    {
        path: 'ciudadano',
        // 3. Seguridad: canMatch evita que se descargue el código si no tiene permiso
        // canMatch: [authGuard, roleGuard('CIUDADANO')],
        loadChildren: () => import('./features/dashboard/routes/ciudadano.routes').then(m => m.CITIZEN_ROUTES)
    },
    {
        path: 'supervisor',
        // canMatch: [authGuard, roleGuard('ADMIN')],
        loadChildren: () => import('./features/dashboard/routes/supervisor.routes').then(m => m.SUPERVISOR_ROUTES)
    },
    {
        path: 'operador',
        // canMatch: [authGuard, roleGuard('ADMIN')],
        loadChildren: () => import('./features/dashboard/routes/operador.routes').then(m => m.OPERADOR_ROUTES)
    },
    {
        path: 'jefe',
        // canMatch: [authGuard, roleGuard('ADMIN')],
        loadChildren: () => import('./features/dashboard/routes/jefe.routes').then(m => m.JEFE_ROUTES)
    },
    {
        path: 'admin',
        // canMatch: [authGuard, roleGuard('ADMIN')],
        loadChildren: () => import('./features/dashboard/routes/admin.routes').then(m => m.ADMIN_ROUTES)
    },
    {
        path: '**',
        redirectTo: 'auth/login'
    }
];
