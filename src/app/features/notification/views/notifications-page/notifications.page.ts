// import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
// import { faCheckDouble, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
// import { CommonModule } from '@angular/common';
// import { NotificacionFacade } from '@/data/services/notificacion.facade';
// import { NotificacionResponse } from '@/core/api/notificaciones/models/notificacion-response';
// import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
// import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// import { NotificationItemComponent } from '@/shared/ui/notification-item/notifiaction-item.component';

// @Component({
//     selector: 'app-notifications-history',
//     standalone: true,
//     imports: [CommonModule, FontAwesomeModule, NotificationItemComponent],
//     templateUrl: 'notifications.page.html',
//     changeDetection: ChangeDetectionStrategy.OnPush
// })

// export class NotificationsPage {
//     protected notificacionFacade = inject(NotificacionFacade);
//     protected notificaciones = this.notificacionFacade.notificaciones;
//     protected loading = this.notificacionFacade.loading;
//     protected error = this.notificacionFacade.error;

//     marcarComoLeida(id: number) {
//         this.notificacionFacade.marcarComoLeida(id);
//     }

//     marcarTodasComoLeidas() {
//         this.notificacionFacade.marcarTodasComoLeidas();
//     }


//     notifications = input<NotificacionResponse[]>([]);

//     // Eventos hacia el padre
//     markAsRead = output<number>();
//     markAllRead = output<void>();

//     // Signal computada para saber si hay notificaciones
//     hasNotifications = computed(() => this.notifications().length > 0);

//     // Signal computada para contar las no leídas
//     unreadCount = computed(() => this.notifications().filter(n => !n.leida).length);

//     // Icons
//     protected readonly faCheckDouble: IconDefinition = faCheckDouble;
//     protected readonly faCircleCheck: IconDefinition = faCircleCheck;

//     /**
//      * Acción para marcar todas como leídas.
//      */
//     markAllAsRead(): void {
//         this.markAllRead.emit();
//     }

//     /**
//      * Acción para marcar una como leída
//      */
//     onNotificationClick(note: NotificacionResponse): void {
//         if (!note.leida && note.id) {
//             this.markAsRead.emit(note.id);
//         }
//     }
// }

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
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
export class NotificationsPage {
    private readonly facade = inject(NotificacionFacade);

    protected readonly icons = {
        checkDouble: faCheckDouble,
        circleCheck: faCircleCheck
    };

    protected readonly notifications = this.facade.notificaciones;
    protected readonly loading = this.facade.loading;
    protected readonly error = this.facade.error;

    protected readonly hasNotifications = computed(() =>
        this.notifications().length > 0
    );

    protected readonly unreadCount = computed(() =>
        this.notifications().filter(n => !n.leida).length
    );

    markAllAsRead(): void {
        // Evitamos llamar al servicio si no hay nada que marcar
        if (this.unreadCount() > 0) {
            this.facade.marcarTodasComoLeidas();
        }
    }

    onNotificationClick(note: NotificacionResponse): void {
        if (!note.leida && note.id) {
            this.facade.marcarComoLeida(note.id);
        }
    }
}
