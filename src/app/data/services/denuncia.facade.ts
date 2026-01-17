import { CrearDenunciaRequest, EvidenceId } from '@/core/api/denuncias/models';
import { DenunciaView } from '@/core/model/denuncia.model';
import { CiudadanoService as DenunciasApiService, GestionInternaService } from '@/core/api/denuncias/services';
import { Injectable, inject, signal } from '@angular/core';
import { LoggerService } from '@/core/service/logging/logger.service';
import { FileUploadService } from '@/core/service/file-upload.service';


@Injectable({
    providedIn: 'root'
})
export class DenunciaFacade {
    private readonly denunciaService = inject(DenunciasApiService);
    private readonly gestionInternaService = inject(GestionInternaService);
    private readonly logger = inject(LoggerService);
    private readonly uploadService = inject(FileUploadService);

    private readonly _loading = signal(false);
    private readonly _error = signal<string | null>(null);
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    private readonly _denuncias = signal<DenunciaView[]>([]);
    public denuncias = this._denuncias.asReadonly();

    private readonly _currentDenuncia = signal<DenunciaView | null>(null);
    public currentDenuncia = this._currentDenuncia.asReadonly();

    async loadAll(): Promise<void> {
        this._loading.set(true);

        try {
            const data = await this.denunciaService.denunciasMeGet();
            this._denuncias.set(data || []);
        } catch {
            this._error.set("No se pudo cargar las denuncias.");
            this._denuncias.set([]);
        } finally {
            this._loading.set(false);
        }
    }

    async loadById(id: number): Promise<void> {
        this._loading.set(true);

        this._currentDenuncia.set(null);

        try {
            // TODO: Reemplazar por el método correcto cuando esté disponible
            // let data: DenunciaView;
            // data = await this.denunciaService.denunciasIdGet({ id });
            // this._currentDenuncia.set(data);
            const list = await this.denunciaService.denunciasMeGet();
            const first = Array.isArray(list) && list.length > 0 ? list[0] : null;
            this._currentDenuncia.set(first);

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
        try {
            await this.gestionInternaService.denunciasIdAsignacionPost({
                // TODO: Eliminar, el front no envía la denuncia
                id: 1,
                body: { operadorId: idOperador }
            });
        } catch {
            this._error.set('Error al asignar la denuncia a operador.');
        } finally {
            this._loading.set(false);
        }
    }

    async asignarJefePorSupervisor(idDenuncia: number, idOperador: number): Promise<void> {
        this._loading.set(true);
        this._error.set(null);


        try {
            // TODO: Reemplazar por el método correcto cuando esté disponible del back
            // await this.gestionInternaService.denunciasIdAsignacionPost({
            //     id: idDenuncia,
            //     body: { operadorId: idOperador }
            // });
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
            await this.gestionInternaService.denunciasIdResolucionPatch({
                id,
                body: {
                    ...(comentarioResolucion ? { comentarioTecnico: comentarioResolucion } : {}),
                    ...(evidenciasIds ? { evidenciaIds: evidenciasIds } : {})
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
            // await this.gestionInternaService.denunciasIdResolucionPatch({
            //     id: idDenuncia,
            // });
        } catch {
            this._error.set('Error al marcar la denuncia como resuelta.');
        } finally {
            this._loading.set(false);
        }
    }

    async validarDenunciaPorSupervisor(aprobada: boolean, comentarioObservacion?: string): Promise<void> {
        this._loading.set(true);
        this._error.set(null);
        try {
            await this.gestionInternaService.denunciasIdValidacionPatch({
                // TODO: eliminar el idDenuncia, el front no debe enviarlo
                id: 1,
                body: {
                    aprobada,
                    ...(comentarioObservacion ? { comentarioObservacion: comentarioObservacion } : {})
                }
            });
        } catch {
            this._error.set('Error al validar la denuncia.');
        } finally {
            this._loading.set(false);
        }
    }
    constructor() {
        // Constructor sin carga automática: la carga se realizará desde un Resolver
        // o desde el componente que necesite los datos. Evitamos auto-refresh aquí
        // para prevenir llamadas duplicadas al entrar a rutas.
    }

    async crearDenuncia(datos: CrearDenunciaRequest, archivos: File[] = []) {
        this._loading.set(true);
        this._error.set(null);

        if (archivos && archivos.length > 0) {
            const evidenciasIds: EvidenceId[] = [];

            for (const archivo of archivos) {
                const evidenciaId = await this.uploadService.subirEvidencia(archivo);
                evidenciasIds.push(evidenciaId);
            }
            datos.evidenciaIds = datos.evidenciaIds || [];
            datos.evidenciaIds.push(...evidenciasIds);
        }

        //TODO: qué hacer con la respuesta?
        const respuesta = await this.denunciaService.crearDenuncia({ body: datos });
        // this.logger.logInfo('Denuncia creada exitosamente', {
        //     id: respuesta.id,
        //     codigo: respuesta.mensaje
        // });
    }


}
