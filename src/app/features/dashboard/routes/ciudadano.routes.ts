import { Routes } from '@angular/router';
import { CiudadanoDashboardComponent } from '@/features/dashboard/views/ciudadano-dashboard/dashboard.page';
import { DenunciasResolver } from './denuncias.resolver';
import { CrearDenunciaComponent } from '@/features/create-denuncia/crear-denuncia.page';
import { NotificationsPage } from '@/features/notification/views/notifications-page/notifications.page';

export const CITIZEN_ROUTES: Routes = [
    { path: 'dashboard', component: CiudadanoDashboardComponent, resolve: { denunciasLoaded: DenunciasResolver } },
    { path: 'create', component: CrearDenunciaComponent },
    { path: 'notifications', component: NotificationsPage },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
