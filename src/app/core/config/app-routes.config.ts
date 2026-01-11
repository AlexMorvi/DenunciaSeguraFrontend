export const APP_ROUTES = {
    DASHBOARD: 'dashboard',
    DENUNCIAS: 'denuncias',
    NUEVA: 'nueva',
    PERFIL: 'perfil',
    NOTIFICACIONES: 'notificaciones',
    ROLES: 'roles',
    LOGIN: 'login',
    REGISTER: 'register',
    FORGOT_PASSWORD: 'forgot-password',
    CHANGE_PASSWORD: 'change-password',


    absolute: {
        toDetalleUsuario: (id: string) => ['/', 'usuarios', id],
        toDetalleDenuncia: (id: string) => ['/', 'denuncias', id]
    }
} as const;
