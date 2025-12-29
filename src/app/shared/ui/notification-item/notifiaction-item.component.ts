import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBell, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { NotificacionResponse } from '@/core/api/notificaciones/models/notificacion-response';

@Component({
    selector: 'app-notification-item',
    standalone: true,
    imports: [CommonModule, FontAwesomeModule],
    templateUrl: './notification-item.component.html',
})
export class NotificationItemComponent {
    notification = input.required<NotificacionResponse>();
    clicked = output<NotificacionResponse>();
    protected readonly faBell: IconDefinition = faBell;
    protected readonly faChevronRight: IconDefinition = faChevronRight;
}
