import { Routes } from '@angular/router';
import { LoginComponent } from '../../auth/login/login.component';
import { RegisterComponent } from '../../auth/register/register.component';
import { ForgotPasswordComponent } from '../../auth/forgot-password/forgot-password.component';
import { ChangePasswordComponent } from '../../auth/change-password/change-password.component';
import { ChangePasswordErrorComponent } from '../../auth/change-password-error/change-password-error.component';

// Exportamos con el nombre 'AUTH_ROUTES' para ser explícitos
export const AUTH_ROUTES: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'change-password', component: ChangePasswordComponent },
    { path: 'change-password-error', component: ChangePasswordErrorComponent }
];
