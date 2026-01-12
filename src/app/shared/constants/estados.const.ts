/*
 * Constantes de estados para `EstadoDenunciaEnum`.
 * Generadas a partir del enum para uso centralizado en la UI y lógica.
 */
import { EstadoDenunciaEnum } from '@/core/api/denuncias/models';

export const ESTADOS_DENUNCIA = {
    RECIBIDA: 'RECIBIDA' as EstadoDenunciaEnum,
    ASIGNADA: 'ASIGNADA' as EstadoDenunciaEnum,
    EN_PROCESO: 'EN_PROCESO' as EstadoDenunciaEnum,
    EN_VALIDACION: 'EN_VALIDACION' as EstadoDenunciaEnum,
    RESUELTA: 'RESUELTA' as EstadoDenunciaEnum,
    RECHAZADA: 'RECHAZADA' as EstadoDenunciaEnum
} as const;

export const ESTADOS_DENUNCIA_ARRAY = Object.values(ESTADOS_DENUNCIA) as EstadoDenunciaEnum[];

export const ESTADOS_UI_OPTIONS = [
    { label: 'Recibida', value: ESTADOS_DENUNCIA.RECIBIDA, dotColor: 'bg-yellow-400' },
    {
        label: 'En Progreso',
        value: [
            ESTADOS_DENUNCIA.ASIGNADA,
            ESTADOS_DENUNCIA.EN_PROCESO,
            ESTADOS_DENUNCIA.EN_VALIDACION
        ],
        dotColor: 'bg-blue-500'
    },
    { label: 'Resuelta', value: ESTADOS_DENUNCIA.RESUELTA, dotColor: 'bg-green-500' },
    { label: 'Rechazada', value: ESTADOS_DENUNCIA.RECHAZADA, dotColor: 'bg-red-500' }
];

export const ESTADO_BADGE_CLASSES: Record<string, string> = {
    RECIBIDA: 'bg-yellow-100 text-yellow-800',
    ASIGNADA: 'bg-indigo-100 text-indigo-800',
    EN_PROCESO: 'bg-blue-100 text-blue-800',
    EN_VALIDACION: 'bg-purple-100 text-purple-800',
    RESUELTA: 'bg-green-100 text-green-800',
    RECHAZADA: 'bg-red-100 text-red-800'
};

export default ESTADOS_DENUNCIA;
