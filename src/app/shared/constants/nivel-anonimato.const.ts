import { NivelAnonimatoEnum } from '@/core/api/denuncias/models/nivel-anonimato-enum';

export const NIVEL_ANONIMATO: Record<NivelAnonimatoEnum, NivelAnonimatoEnum> = {
    REAL: 'REAL',
    PSEUDOANONIMO: 'PSEUDOANONIMO',
    ANONIMO: 'ANONIMO'
} as const;

export default NIVEL_ANONIMATO;
