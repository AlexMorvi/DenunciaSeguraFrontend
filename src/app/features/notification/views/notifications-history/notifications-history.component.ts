
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para DatePipe y UpperCasePipe
import { HeaderComponent } from '@/app/shared/ui/header/header.component';
import { SidebarComponent } from '@/app/shared/ui/sidebar/sidebar.component';
import { NotificationsListComponent } from '@/app/features/ciudadano/notifications-list/notifications-list.component';
import { NotificacionFacade } from '@/app/data/services/notificacion.facade';

@Component({
    selector: 'app-notifications-history',
    standalone: true,
    imports: [CommonModule, HeaderComponent, SidebarComponent, NotificationsListComponent],
    templateUrl: 'notifications-history.component.html',
})

export class CiudadanoNotificationsHistoryComponent {
    protected notificacionFacade = inject(NotificacionFacade);
    protected notificaciones = this.notificacionFacade.notificaciones;
    protected loading = this.notificacionFacade.loading;
    protected error = this.notificacionFacade.error;

    marcarComoLeida(id: number) {
        this.notificacionFacade.marcarComoLeida(id);
    }

    marcarTodasComoLeidas() {
        this.notificacionFacade.marcarTodasComoLeidas();
    }
}
