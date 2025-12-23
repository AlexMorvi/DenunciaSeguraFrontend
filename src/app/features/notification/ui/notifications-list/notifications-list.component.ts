import { Component, input, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionResponse } from '@/core/api/notificaciones/models/notificacion-response';
import { NotificationItemComponent } from '@/shared/ui/notification-item/notifiaction-item.component';

@Component({
    selector: 'app-notifications-list',
    standalone: true,
    imports: [CommonModule, NotificationItemComponent],
    templateUrl: './notifications-list.component.html',
    styles: [`
    :host { display: block; }
  `]
})
export class NotificationsListComponent {
    // Recibimos las notificaciones desde el componente padre
    notifications = input<NotificacionResponse[]>([]);

    // Eventos hacia el padre
    markAsRead = output<number>();
    markAllRead = output<void>();

    // Signal computada para saber si hay notificaciones
    hasNotifications = computed(() => this.notifications().length > 0);

    // Signal computada para contar las no leídas
    unreadCount = computed(() => this.notifications().filter(n => !n.leida).length);

    /**
     * Acción para marcar todas como leídas.
     */
    markAllAsRead(): void {
        this.markAllRead.emit();
    }

    /**
     * Acción para marcar una como leída
     */
    onNotificationClick(note: NotificacionResponse): void {
        if (!note.leida && note.id) {
            this.markAsRead.emit(note.id);
        }
    }
}
