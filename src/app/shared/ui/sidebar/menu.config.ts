import { ROLES } from "@/shared/constants/roles.const";
import { MenuItem } from "./menu.types";
import { faBell, faUser, faUsers, faUserPlus } from '@fortawesome/free-solid-svg-icons';

export const MENU_ITEMS: MenuItem[] = [
    {
        label: 'Ir al perfil de usuario',
        icon: faUser,
        path: 'perfil',
        allowedRoles: Object.values(ROLES),
    },
    {
        label: 'Ir al panel principal',
        icon: faUsers,
        path: 'dashboard',
        allowedRoles: Object.values(ROLES),
    },
    // {
    //     label: 'Ver notificaciones',
    //     icon: faBell,
    //     path: 'notificaciones',
    //     allowedRoles: [ROLES.CIUDADANO],
    //     showBadge: true
    // },
    {
        label: 'Crear usuarios',
        icon: faUserPlus,
        path: 'roles',
        allowedRoles: [ROLES.ADMIN_PLATAFORMA],
    },
];
