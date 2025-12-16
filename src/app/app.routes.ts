// import { Routes } from '@angular/router';
// import { LoginComponent } from '@/app/features/auth/login/login.component';
// import { RegisterComponent } from '@/app/features/auth/register/register.component';
// import { ForgotPasswordComponent } from '@/app/features/auth/forgot-password/forgot-password.component';
// import { ChangePasswordComponent } from '@/app/features/auth/change-password/change-password.component';
// import { ChangePasswordErrorComponent } from '@/app/features/auth/change-password-error/change-password-error.component';
// import { CiudadanoDashboardComponent } from '@/app/features/ciudadano/dashboard/dashboard.component';

// export const routes: Routes = [
//     { path: '', redirectTo: '/login', pathMatch: 'full' },
//     { path: 'login', component: LoginComponent },
//     { path: 'register', component: RegisterComponent },
//     { path: 'forgot-password', component: ForgotPasswordComponent },
//     { path: 'change-password', component: ChangePasswordComponent },
//     { path: 'change-password-error', component: ChangePasswordErrorComponent },
//     { path: 'ciudadano/dashboard', component: CiudadanoDashboardComponent },
//     { path: '**', redirectTo: '/login' }
// ];
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
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
    },

    // 3. Módulo de CIUDADANO
    {
        path: 'ciudadano',
        loadChildren: () => import('./features/ciudadano/ciudadano.routes').then(m => m.CITIZEN_ROUTES)
    },

    // 4. Módulo de ADMINISTRADOR
    {
        path: 'admin',
        loadChildren: () => import('./features/admin/admmin.routes').then(m => m.ADMIN_ROUTES)
    },

    // 5. Wildcard (404): Para cualquier URL que no exista
    {
        path: '**',
        redirectTo: 'auth/login' // O a un componente NotFoundComponent
    }
];
