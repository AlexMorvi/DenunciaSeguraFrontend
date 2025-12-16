import { Routes } from '@angular/router';
import { CiudadanoDashboardComponent } from './dashboard/dashboard.component';
import { CrearDenunciaComponent } from './create-denuncia/crear-denuncia.component';
import { CiudadanoNotificationsHistoryComponent } from './notifications-history/notifications-history.component';

export const CITIZEN_ROUTES: Routes = [
    { path: 'dashboard', component: CiudadanoDashboardComponent },
    { path: 'create', component: CrearDenunciaComponent },
    { path: 'notifications', component: CiudadanoNotificationsHistoryComponent },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
