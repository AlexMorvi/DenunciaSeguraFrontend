
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '@/shared/ui/header/header.component';
import { SidebarComponent } from '@/shared/ui/sidebar/sidebar.component';
import { NotificationsListComponent } from '@/features/notification/ui/notifications-list/notifications-list.component';
import { NotificacionFacade } from '@/data/services/notificacion.facade';

@Component({
    selector: 'app-notifications-history',
    standalone: true,
    imports: [CommonModule, HeaderComponent, SidebarComponent, NotificationsListComponent],
    templateUrl: 'notifications.page.html',
})

export class NotificationsPage {
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
