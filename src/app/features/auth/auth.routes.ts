import { Routes } from '@angular/router';
import { LoginComponent } from '../../auth/login/login.page';
import { RegisterComponent } from '../../auth/register/register.page';
import { ForgotPasswordComponent } from '../../auth/forgot-password/forgot-password.page';
import { ChangePasswordComponent } from '../../auth/change-password/change-password.page';
import { ChangePasswordErrorComponent } from '../../auth/change-password-error/change-password-error.page';
import { AuthLayoutComponent } from '@/core/layout/auth-layout/auth-layout.component';

// Exportamos con el nombre 'AUTH_ROUTES' para ser explícitos
export const AUTH_ROUTES: Routes = [
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            { path: '', redirectTo: 'login', pathMatch: 'full' },
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent },
            { path: 'forgot-password', component: ForgotPasswordComponent },
            { path: 'change-password', component: ChangePasswordComponent },
            { path: 'change-password-error', component: ChangePasswordErrorComponent }
        ]
    }
];
