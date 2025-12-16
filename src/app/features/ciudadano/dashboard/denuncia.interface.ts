export interface Denuncia {
    id: number;
    titulo: string;
    categoria: string;
    estado: 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO' | 'RECHAZADO';
    descripcion: string;
    latitud: number | null;
    longitud: number | null;
    fechaCreacion: string; // ISO 8601
    fotoUrl?: string;
    fotoResolucion?: string;
    comentarioResolucion?: string;
}
