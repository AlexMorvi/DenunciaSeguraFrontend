import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckDouble, faCircleCheck } from '@fortawesome/free-solid-svg-icons';

// Asegúrate de que las rutas sean correctas
import { NotificacionFacade } from '@/data/services/notificacion.facade';
import { NotificacionResponse } from '@/core/api/notificaciones/models/notificacion-response';
import { NotificationItemComponent } from '@/shared/ui/notification-item/notifiaction-item.component';

@Component({
    selector: 'app-notifications-page',
    standalone: true,
    imports: [CommonModule, FontAwesomeModule, NotificationItemComponent],
    templateUrl: './notifications.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsPage implements OnInit {
    private readonly notificacionService = inject(NotificacionFacade);

    protected readonly icons = {
        checkDouble: faCheckDouble,
        circleCheck: faCircleCheck
    };


    protected readonly notifications = this.notificacionService.notificaciones;
    protected readonly loading = this.notificacionService.loading;
    protected readonly error = this.notificacionService.error;

    protected readonly hasNotifications = computed(() =>
        this.notifications().length > 0
    );

    ngOnInit(): void {
        this.notificacionService.getAll();
    }

    protected readonly unreadCount = computed(() =>
        this.notifications().filter(n => !n.leida).length
    );

    markAllAsRead(): void {
        // Evitamos llamar al servicio si no hay nada que marcar
        if (this.unreadCount() > 0) {
            this.notificacionService.marcarTodasComoLeidas();
        }
    }

    onNotificationClick(note: NotificacionResponse): void {
        if (!note.leida && note.id) {
            this.notificacionService.marcarComoLeida(note.id);
        }
    }
}
