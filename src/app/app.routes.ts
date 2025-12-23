import { Routes } from '@angular/router';

export const routes: Routes = [
    // 1. Ruta por defecto: Redirige a donde quieras probar primero (ej. ciudadano)
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },

    // 2. Módulo de AUTENTICACIÓN (Lazy load route arrays from feature files)
    {
        path: 'auth',
        loadChildren: () => import('./features/dashboard/routes/auth.routes').then(m => m.AUTH_ROUTES)
    },

    // 3. Módulo de CIUDADANO
    {
        path: 'ciudadano',
        loadChildren: () => import('./features/dashboard/routes/ciudadano.routes').then(m => m.CITIZEN_ROUTES)
    },

    // 4. Módulo de ADMINISTRADOR
    {
        path: 'admin',
        loadChildren: () => import('./features/dashboard/routes/admmin.routes').then(m => m.ADMIN_ROUTES)
    },

    // 5. Wildcard (404): Para cualquier URL que no exista
    {
        path: '**',
        redirectTo: 'auth/login' // O a un componente NotFoundComponent
    }
];
