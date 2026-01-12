import { Routes } from '@angular/router';
// import { authGuard } from './core/auth/guards/auth.guard'; // 1. Importa tus guards
import { roleMatchGuard } from './core/guards/role.guard';
import { authGuard } from './core/guards/auth.guard';
import { ROLES } from './shared/constants/roles.const';
import { AuthLayoutComponent } from './core/layout/auth-layout/auth-layout.component';
import { LoginComponent } from './features/auth/login/login.page';
import { RegisterComponent } from './features/auth/register/register.page';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.page';
import { APP_ROUTES } from './core/config/app-routes.config';

export const routes: Routes = [
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            { path: '', redirectTo: APP_ROUTES.LOGIN, pathMatch: 'full' },
            { path: APP_ROUTES.LOGIN, component: LoginComponent },
            { path: APP_ROUTES.REGISTER, component: RegisterComponent },
            { path: APP_ROUTES.FORGOT_PASSWORD, component: ForgotPasswordComponent },
            // { path: 'change-password', component: ChangePasswordComponent },
            // { path: 'change-password-error', component: ChangePasswordErrorComponent }
        ]
    },
    {
        path: '',
        canMatch: [authGuard, roleMatchGuard(ROLES.CIUDADANO)],
        loadChildren: () => import('./features/ciudadano/ciudadano.routes').then(m => m.CITIZEN_ROUTES)
    },
    {
        path: '',
        canMatch: [authGuard, roleMatchGuard(ROLES.SUPERVISOR)],
        loadChildren: () => import('./features/supervisor/supervisor.routes').then(m => m.SUPERVISOR_ROUTES)
    },
    {
        path: '',
        canMatch: [authGuard, roleMatchGuard(ROLES.OPERADOR_INTERNO)],
        loadChildren: () => import('./features/operador/operador.routes').then(m => m.OPERADOR_ROUTES)
    },
    {
        path: '',
        canMatch: [authGuard, roleMatchGuard(ROLES.JEFE_INTERNO)],
        loadChildren: () => import('./features/jefe/jefe.routes').then(m => m.JEFE_ROUTES)
    },
    {
        path: '',
        canMatch: [authGuard, roleMatchGuard(ROLES.ADMIN_PLATAFORMA)],
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
    },
    {
        path: '**',
        redirectTo: 'auth/login'
    }
];
