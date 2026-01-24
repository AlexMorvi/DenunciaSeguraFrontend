import { CrearDenunciaRequest, DenunciaResponse, DenunciaListadoResponse, EntidadResponsableEnum, DenunciaEstadoHistorialResponse } from '@/core/api/denuncias/models';
import { DenunciasService } from '@/core/api/denuncias/services/denuncias.service';
import { WorkflowService } from '@/core/api/denuncias/services/workflow.service';
import { Injectable, inject, signal } from '@angular/core';
import { LoggerService } from '@/core/service/logging/logger.service';
import { FileUploadService } from '@/core/service/file-upload.service';


import { CategoriaDenunciaEnum } from '@/core/api/denuncias/models/categoria-denuncia-enum';
import { NivelAnonimatoEnum } from '@/core/api/denuncias/models/nivel-anonimato-enum';

export interface CreacionDenunciaData {
    titulo: string;
    descripcion: string;
    categoriaDenuncia: CategoriaDenunciaEnum;
    nivelAnonimato: NivelAnonimatoEnum;
    latitud: number;
    longitud: number;
    archivos?: File[];
}

@Injectable({
    providedIn: 'root'
})
export class DenunciaFacade {
    private readonly denunciaService = inject(DenunciasService);
    private readonly workflowService = inject(WorkflowService);
    private readonly logger = inject(LoggerService);
    private readonly uploadService = inject(FileUploadService);

    private readonly _loading = signal(false);
    private readonly _error = signal<string | null>(null);
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    private readonly _denuncias = signal<DenunciaListadoResponse[]>([]);
    public denuncias = this._denuncias.asReadonly();

    private readonly _currentDenuncia = signal<DenunciaResponse | null>(null);
    public currentDenuncia = this._currentDenuncia.asReadonly();

    private readonly _historialEstados = signal<DenunciaEstadoHistorialResponse | null>(null);
    public historialEstados = this._historialEstados.asReadonly();

    async loadAll(): Promise<void> {
        console.log('[DenunciaFacade] loadAll: Iniciando carga de denuncias...');
        this._loading.set(true);

        try {
            const data = await this.denunciaService.listarDenuncias();
            console.log('[DenunciaFacade] Denuncias cargadas:', data);
            this._denuncias.set(data || []);
        } catch (error) {
            console.error('[DenunciaFacade] Error cargando denuncias:', error);
            this._error.set("No se pudo cargar las denuncias.");
            this._denuncias.set([]);
        } finally {
            this._loading.set(false);
        }
    }

    async obtenerDenunciaPorId(id: number): Promise<void> {
        this._loading.set(true);

        this._currentDenuncia.set(null);

        try {
            const data = await this.denunciaService.obtenerDenunciaPorId({ denunciaId: id });
            this._currentDenuncia.set(data);
        } catch {
            this._error.set("No se pudo cargar la información de la denuncia.");
            this._currentDenuncia.set(null);
        } finally {
            this._loading.set(false);
        }
    }

    async asignarOperadorPorJefe(idOperador: number): Promise<void> {
        this._loading.set(true);
        this._error.set(null);

        const denunciaId = this._currentDenuncia()?.id;
        if (!denunciaId) {
            this._error.set('No hay denuncia seleccionada para asignar.');
            this._loading.set(false);
            return;
        }

        try {
            await this.workflowService.asignarOperadorAdenuncia({
                denunciaId: denunciaId,
                body: { operadorId: idOperador }
            });
        } catch {
            this._error.set('Error al asignar la denuncia a operador.');
        } finally {
            this._loading.set(false);
        }
    }

    async asignarJefePorSupervisor(idDenuncia: number, entidadId: number): Promise<void> {
        this._loading.set(true);
        this._error.set(null);

        try {
            await this.workflowService.asignarEntidadADenuncia({
                denunciaId: idDenuncia,
                entidad: entidadId as unknown as EntidadResponsableEnum
            });
        } catch {
            this._error.set('Error al asignar la denuncia a entidad responsable.');
        } finally {
            this._loading.set(false);
        }
    }

    async resolverDenunciaPorOperador(id: number, comentarioResolucion: string, evidenciasIds?: string[]): Promise<void> {
        this._loading.set(true);
        this._error.set(null);

        try {
            await this.workflowService.resolverDenuncia({
                denunciaId: id,
                body: {
                    comentarioResolucion,
                    evidenciasIds: evidenciasIds || []
                }
            });
        } catch {
            this._error.set('Error al marcar la denuncia como resuelta.');
        } finally {
            this._loading.set(false);
        }
    }

    async iniciarDenunciaPorOperador(idDenuncia: number): Promise<void> {
        this._loading.set(true);
        this._error.set(null);

        try {
            await this.workflowService.iniciarProcesoDenunciaOperadores({
                denunciaId: idDenuncia,
            });
        } catch {
            this._error.set('Error al iniciar la denuncia.');
        } finally {
            this._loading.set(false);
        }
    }

    async validarDenunciaPorSupervisor(aprobada: boolean, comentarioObservacion?: string): Promise<void> {
        this._loading.set(true);
        this._error.set(null);

        const denunciaId = this._currentDenuncia()?.id;
        if (!denunciaId) {
            this._error.set('No hay denuncia seleccionada para validar.');
            this._loading.set(false);
            return;
        }

        try {
            await this.workflowService.validarSolucionDenuncia({
                denunciaId: denunciaId,
                body: {
                    aprobada,
                    comentarioObservacion: comentarioObservacion || ''
                }
            });
        } catch {
            this._error.set('Error al validar la denuncia.');
        } finally {
            this._loading.set(false);
        }
    }


    async rechazarDenuncia(motivo: string): Promise<void> {
        this._loading.set(true);
        this._error.set(null);

        const denunciaId = this._currentDenuncia()?.id;

        if (!denunciaId) {
            this._error.set('No hay denuncia seleccionada para rechazar.');
            this._loading.set(false);
            return;
        }

        try {
            await this.workflowService.rechazarDenuncia({
                denunciaId: denunciaId,
                body: { motivo }
            });
            await this.obtenerDenunciaPorId(denunciaId);
        } catch {
            this._error.set('Error al rechazar la denuncia.');
        } finally {
            this._loading.set(false);
        }
    }

    async obtenerHistorialEstados(idDenuncia: number): Promise<void> {
        this._loading.set(true);
        this._historialEstados.set(null);

        try {
            const data = await this.workflowService.denunciaHistorialEstados({ denunciaId: idDenuncia });
            this._historialEstados.set(data);
        } catch {
            // Error silently ignored or handled by UI state if needed
        } finally {
            this._loading.set(false);
        }
    }

    async crearDenuncia(datos: CreacionDenunciaData): Promise<void> {
        this._loading.set(true);
        this._error.set(null);

        try {
            const { archivos, ...detallesDenuncia } = datos;
            const evidenciasIds: string[] = [];

            if (archivos && archivos.length > 0) {
                for (const archivo of archivos) {
                    const evidenciaId = await this.uploadService.subirEvidencia(archivo);
                    evidenciasIds.push(evidenciaId);
                }
            }

            const request: CrearDenunciaRequest = {
                ...detallesDenuncia,
                evidenciasIds
            };

            await this.denunciaService.crearDenuncia({ body: request });
        } catch (error) {
            this._error.set('No se pudo crear la denuncia.');
            throw error;
        } finally {
            this._loading.set(false);
        }
    }


}
