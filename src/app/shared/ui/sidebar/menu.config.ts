import { ROLES } from "@/shared/constants/roles.const";
import { MenuItem } from "./menu.types";
import { faBell, faUsers } from '@fortawesome/free-solid-svg-icons';

export const MENU_ITEMS: MenuItem[] = [
    {
        label: 'Ir al panel principal',
        icon: faUsers,
        pathFragment: 'dashboard',
        allowedRoles: Object.values(ROLES),
    },
    {
        label: 'Ver notificaciones',
        icon: faBell,
        pathFragment: 'notificaciones', // Esto generará /rol/notificaciones
        allowedRoles: [ROLES.CIUDADANO], // Admin quizás no tiene notificaciones
        showBadge: true
    }
];
