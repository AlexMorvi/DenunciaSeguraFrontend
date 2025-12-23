import { Routes } from '@angular/router';
import { CiudadanoDashboardComponent } from '../views/ciudadano-dashboard/dashboard.component';
import { DenunciasResolver } from './denuncias.resolver';
import { CrearDenunciaComponent } from '../../create-denuncia/crear-denuncia.component';
import { CiudadanoNotificationsHistoryComponent } from '../../notification/views/notifications-history/notifications-history.component';

export const CITIZEN_ROUTES: Routes = [
    { path: 'dashboard', component: CiudadanoDashboardComponent, resolve: { denunciasLoaded: DenunciasResolver } },
    { path: 'create', component: CrearDenunciaComponent },
    { path: 'notifications', component: CiudadanoNotificationsHistoryComponent },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
