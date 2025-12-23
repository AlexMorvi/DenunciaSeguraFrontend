import { CrearDenunciaRequest, DenunciaCitizenViewResponse, EvidenceId } from '@/app/core/api/denuncias/models';
import { CiudadanoService as DenunciasApiService } from '@/app/core/api/denuncias/services';
import { ArchivoPreCargaRequest } from '@/app/core/api/evidencias/models/archivo-pre-carga-request';
import { CrearUploadRequest } from '@/app/core/api/evidencias/models/crear-upload-request';
import { CrearUploadResponse } from '@/app/core/api/evidencias/models/crear-upload-response';
import { UploadsService } from '@/app/core/api/evidencias/services/uploads.service';
import { SKIP_AUTH } from '@/app/core/http/http-context';
import { EvidenceUploadError } from '@/app/core/errors/create-denuncia.errors';
import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, from, of } from 'rxjs';

const PROPOSITO_CARGA = 'CIUDADANO_CREACION';

@Injectable({
    providedIn: 'root'
})
export class DenunciaFacade {
    private api = inject(DenunciasApiService);
    private uploadsService = inject(UploadsService);
    private router = inject(Router);
    private http = inject(HttpClient);

    private _loading = signal(false);
    private _error = signal<string | null>(null);
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    // Señal interna para la lista de denuncias y acceso público de solo-lectura
    private _denuncias = signal<DenunciaCitizenViewResponse[]>([]);
    public denuncias = this._denuncias.asReadonly();

    // Refrescar la lista de denuncias desde la API
    async refresh(): Promise<void> {
        this._loading.set(true);
        console.debug('[DenunciaFacade] refresh() start');
        try {
            const data = await firstValueFrom(
                from(this.api.denunciasMeGet()).pipe(
                    catchError(() => of([] as DenunciaCitizenViewResponse[]))
                )
            );
            console.debug('[DenunciaFacade] refresh() api returned, items:', Array.isArray(data) ? data.length : 'unknown');
            this._denuncias.set(data || []);
            console.debug('[DenunciaFacade] refresh() set signal, current length:', this._denuncias().length);
        } catch (err) {
            // Log para depuración en caso de errores en la carga inicial
            console.error('[DenunciaFacade] Error cargando denuncias:', err);
            this._denuncias.set([]);
        } finally {
            this._loading.set(false);
            console.debug('[DenunciaFacade] refresh() end');
        }
    }

    constructor() {
        // Constructor sin carga automática: la carga se realizará desde un Resolver
        // o desde el componente que necesite los datos. Evitamos auto-refresh aquí
        // para prevenir llamadas duplicadas al entrar a rutas.
    }

    async crearDenuncia(datos: CrearDenunciaRequest, archivo?: File | null) {
        this._loading.set(true);
        this._error.set(null);

        try {
            if (archivo) {
                const idEvidencia = await this.subirEvidencia(archivo);
                datos.evidenciaIds = datos.evidenciaIds || [];
                datos.evidenciaIds.push(idEvidencia);
            }
            const respuesta = await this.api.crearDenuncia({ body: datos });
            this.router.navigate(['/ciudadano/dashboard']);

        } catch (err: any) {
            const mensaje = err?.error?.message || err?.message || 'Ocurrió un error inesperado al procesar su solicitud.';
            this._error.set(mensaje);

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
}
