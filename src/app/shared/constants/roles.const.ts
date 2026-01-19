import { RolEnum } from '@/core/api/usuarios/models/rol-enum';

export const ROLES = {
    ADMIN_PLATAFORMA: 'ADMIN_PLATAFORMA' as RolEnum,
    SUPERVISOR: 'SUPERVISOR_DENUNCIAS' as RolEnum,
    JEFE_INTERNO: 'JEFE_INTERNO' as RolEnum,
    JEFE_EXTERNO: 'JEFE_EXTERNO' as RolEnum,
    OPERADOR_INTERNO: 'OPERADOR_INTERNO' as RolEnum,
    OPERADOR_EXTERNO: 'OPERADOR_EXTERNO' as RolEnum,
    AUDITOR: 'AUDITOR' as RolEnum,
    CIUDADANO: 'CIUDADANO' as RolEnum
} as const;
