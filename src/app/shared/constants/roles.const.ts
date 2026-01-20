import { RolEnum } from '@/core/api/usuarios/models/rol-enum';

export const ROLES = {
    ADMIN_PLATAFORMA: 'ADMIN',
    SUPERVISOR: 'SUPERVISOR',
    JEFE_INTERNO: 'JEFE_OP_INT',
    JEFE_EXTERNO: 'JEFE_OP_EXT',
    OPERADOR_INTERNO: 'OP_INT',
    OPERADOR_EXTERNO: 'OP_EXT',
    CIUDADANO: 'CIUDADANO'
} as const satisfies Record<string, RolEnum>;
