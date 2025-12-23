import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionResponse } from '@/app/core/api/notificaciones/models/notificacion-response';

@Component({
    selector: 'app-notification-item',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './notification-item.component.html',
})
export class NotificationItemComponent {
    notification = input.required<NotificacionResponse>();
    clicked = output<NotificacionResponse>();
}
