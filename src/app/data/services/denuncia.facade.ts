import { CrearDenunciaRequest, DenunciaCitizenViewResponse, DenunciaStaffViewResponse, EvidenceId } from '@/core/api/denuncias/models';
import { CiudadanoService as DenunciasApiService } from '@/core/api/denuncias/services';
import { CrearUploadRequest } from '@/core/api/evidencias/models/crear-upload-request';
import { UploadsService } from '@/core/api/evidencias/services/uploads.service';
import { SKIP_AUTH } from '@/core/http/http-context';
import { EvidenceUploadError } from '@/core/errors/create-denuncia.errors';
import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, firstValueFrom, from, of } from 'rxjs';

const PROPOSITO_CARGA = 'CIUDADANO_CREACION';

@Injectable({
    providedIn: 'root'
})
export class DenunciaFacade {
    private denunciaService = inject(DenunciasApiService);
    private uploadsService = inject(UploadsService);
    private http = inject(HttpClient);

    private _loading = signal(false);
    private _error = signal<string | null>(null);
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    // Señal interna para la lista de denuncias y acceso público de solo-lectura
    private _denuncias = signal<DenunciaCitizenViewResponse[]>([]);
    public denuncias = this._denuncias.asReadonly();

    async refresh(): Promise<void> {
        this._loading.set(true);
        try {
            const data = await firstValueFrom(
                from(this.denunciaService.denunciasMeGet()).pipe(
                    catchError(() => of([] as DenunciaCitizenViewResponse[]))
                )
            );
            this._denuncias.set(data || []);
        } catch (err) {
            this._denuncias.set([]);
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

        try {
            if (archivos && archivos.length > 0) {
                const evidenciasIds: EvidenceId[] = [];

                for (const archivo of archivos) {
                    const evidenciaId = await this.subirEvidencia(archivo);
                    evidenciasIds.push(evidenciaId);
                }
                datos.evidenciaIds = datos.evidenciaIds || [];
                datos.evidenciaIds.push(...evidenciasIds);
            }
            const respuesta = await this.denunciaService.crearDenuncia({ body: datos });
        } catch (err: any) {
            // TODO: Mejorar los mensajes
            const mensaje = err?.error?.message || err?.message || 'Ocurrió un error inesperado al procesar su solicitud.';
            this._error.set(mensaje);
            throw err;

        } finally {
            this._loading.set(false);
        }
    }

    async subirEvidencia(archivo: File): Promise<EvidenceId> {
        try {
            const { uploadUrl, uploadId, evidenceId } = await this.iniciarSesionCarga(archivo);
            await this.cargarArchivoEnNube(uploadUrl, archivo);
            await this.confirmarSubida(uploadId, evidenceId);

            return evidenceId;
        } catch (error) {
            // TODO: Loguear el error correctamente y por cada archivo, en caso de que uno falle
            throw new EvidenceUploadError('No se pudo subir la evidencia. Por favor, intente nuevamente.');
        }

    }

    private async iniciarSesionCarga(archivo: File) {
        const payload: CrearUploadRequest = {
            proposito: PROPOSITO_CARGA,
            archivos: [{
                nombreArchivo: archivo.name,
                contentType: archivo.type,
                sizeBytes: archivo.size
            }]
        };

        const response = await this.uploadsService.uploadsPost({ body: payload });
        const item = response.items?.[0];

        // Cláusulas de guarda para validación temprana
        if (!response.uploadId || !item?.uploadUrl || !item?.evidenceId) {
            throw new Error('La sesión de carga no devolvió los datos requeridos (URL o IDs faltantes).');
        }

        return {
            uploadId: response.uploadId,
            uploadUrl: item.uploadUrl,
            evidenceId: item.evidenceId
        };
    }

    private async cargarArchivoEnNube(url: string, archivo: File): Promise<void> {
        // Aquí encapsulamos la complejidad de HTTP headers y Contextos
        await firstValueFrom(
            this.http.put(url, archivo, {
                headers: new HttpHeaders({ 'Content-Type': archivo.type }),
                context: new HttpContext().set(SKIP_AUTH, true)
            })
        );
    }

    private async confirmarSubida(uploadId: string, evidenceId: string): Promise<void> {
        await this.uploadsService.uploadsUploadIdConfirmarPost({
            uploadId,
            body: { evidenceIds: [evidenceId] }
        });
    }

    async getById(denunciaId: number): Promise<DenunciaStaffViewResponse> {
        // await this.denunciasService.uploadsUploadIdConfirmarPost({
        //     uploadId,
        //     body: { evidenceIds: [evidenceId] }
        // });
        return null as any;
    }
}
