import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export type UserRole = 'ADMIN_PLATAFORMA' | 'OPERADOR_INTERNO' | 'CIUDADANO' | 'SUPERVISOR_DENUNCIAS' | 'JEFE_INTERNO';

export interface MenuItem {
    label: string;
    icon: IconDefinition;
    path: string;
    allowedRoles: string[];
    showBadge?: boolean;
}
