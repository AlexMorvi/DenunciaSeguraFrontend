import { RolEnum } from '@/core/api/auth/models/rol-enum';

export const APP_ROLES = {
    ADMIN: 'ADMIN_PLATAFORMA' as RolEnum,
    CIUDADANO: 'CIUDADANO' as RolEnum,
} as const;
