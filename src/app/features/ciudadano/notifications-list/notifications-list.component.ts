import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

// 1. Definimos una interfaz segura para el modelo de datos.
// Esto ayuda a prevenir errores de tipo y asegura la estructura de los datos.
export interface NotificationUiModel {
    id: number;
    message: string;
    date: string;
    isNew: boolean;
    read: boolean;
}

@Component({
    selector: 'app-notifications-list',
    standalone: true,
    imports: [CommonModule], // Importamos CommonModule para directivas básicas si fueran necesarias
    templateUrl: './notifications-list.component.html',
    // Usamos estilos en línea o un archivo CSS externo si no usas Tailwind
    styles: [`
    :host { display: block; }
  `]
})
export class NotificationsListComponent {
    // 2. Estado Reactivo usando Signals (Angular 19 moderno)

    // Simulamos datos iniciales. En una app real, esto vendría de un servicio.
    // Inicializamos con un array vacío para probar el estado "No tienes notificaciones".
    // Descomenta los objetos dentro para ver la lista.
    notificationsList = signal<NotificationUiModel[]>([
        { id: 1, message: 'Mensaje de sistema', date: 'Hace 5 minutos', isNew: true, read: false },
        { id: 2, message: 'Tu reporte está listo', date: 'Ayer', isNew: false, read: false },
    ]);

    // Signal computada para saber si hay notificaciones (reactivo)
    hasNotifications = computed(() => this.notificationsList().length > 0);

    /**
     * Acción para marcar todas como leídas.
     * En un escenario real, esto llamaría a un servicio API.
     */
    markAllAsRead(): void {
        // Actualizamos el signal de forma inmutable
        this.notificationsList.update(currentNotifications =>
            currentNotifications.map(note => ({ ...note, read: true, isNew: false }))
        );
        console.log('Todas las notificaciones marcadas como leídas');
    }
}
