import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export type UserRole = 'ADMIN' | 'OPERADOR' | 'CIUDADANO' | 'SUPERVISOR'; // Tus roles

export interface MenuItem {
    label: string; // Para accesibilidad (aria-label)
    icon: IconDefinition;
    pathFragment: string; // La parte final de la URL ('dashboard', 'notificaciones')
    allowedRoles: string[]; // Qué roles pueden ver esto
    showBadge?: boolean; // Si debe mostrar el contador de notificaciones
}
