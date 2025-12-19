import { Injectable, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, from, firstValueFrom } from 'rxjs';
import { CiudadanoService as DenunciasApiService } from '@/app/core/api/denuncias/services';
import { UploadsService } from '@/app/core/api/evidencias/services/uploads.service';
import { DenunciaCitizenViewResponse, CrearDenunciaRequest, EvidenceId } from '@/app/core/api/denuncias/models';
import { CrearUploadRequest } from '@/app/core/api/evidencias/models/crear-upload-request';
import { CrearUploadResponse } from '@/app/core/api/evidencias/models/crear-upload-response';
import { ArchivoPreCargaRequest } from '@/app/core/api/evidencias/models/archivo-pre-carga-request';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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

    public denuncias = toSignal(
        from(this.api.denunciasMeGet()).pipe(
            catchError(error => {
                console.error('Error cargando denuncias:', error);
                return of([]);
            })
        ),
        { initialValue: [] as DenunciaCitizenViewResponse[] }
    );

    // crearDenuncia(datos: CrearDenunciaRequest) {
    //     this._loading.set(true);
    //     this._error.set(null);

    //     this.api.crearDenuncia({ body: datos })
    //         .then((respuesta) => {
    //             // Equivalente al next: del subscribe
    //             console.log('Denuncia creada', respuesta);
    //             this.router.navigate(['/denuncias/mis-denuncias']);
    //         })
    //         .catch((err) => {
    //             // Equivalente al error: del subscribe
    //             console.error('Error al crear', err);
    //             this._error.set('No se pudo crear la denuncia. Inténtalo de nuevo.');
    //         })
    //         .finally(() => {
    //             // Equivalente al finalize() del pipe
    //             this._loading.set(false);
    //         });
    // }
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

            console.log('Denuncia creada con éxito', respuesta);
            this.router.navigate(['/denuncias/mis-denuncias']);

        } catch (err: any) {
            console.error('Error en el proceso:', err);

            const mensaje = err.error?.message || 'Ocurrió un error inesperado al procesar su solicitud.';
            this._error.set(mensaje);

        } finally {
            this._loading.set(false);
        }
    }

    async subirEvidencia(archivo: File): Promise<EvidenceId> {
        try {
            // ---------------------------------------------------------
            // PASO 1: Iniciar Sesión de Carga (Obtener Signed URL)
            // ---------------------------------------------------------

            // Construimos el body según lo que suele pedir 'CrearUploadRequest'
            // Verifica tu interfaz 'CrearUploadRequest' para asegurar los campos correctos.
            const requestBody: ArchivoPreCargaRequest = {
                nombreArchivo: archivo.name,
                contentType: archivo.type,
                // TODO: Calcular hash de integridad
                sizeBytes: archivo.size
            };

            const payloadBody: CrearUploadRequest = {
                proposito: 'CIUDADANO_CREACION',
                archivos: [requestBody]
            };

            const sessionResponse: CrearUploadResponse = await this.uploadsService.uploadsPost({
                body: payloadBody
            });
            const uploadItem = sessionResponse.items?.[0];

            // Usamos 'uploadId' de la raíz (según tu interfaz CrearUploadResponse)
            const idSesion = sessionResponse.uploadId;

            // Asumimos que dentro de 'UploadItemResponse' existe la propiedad 'uploadUrl'
            // (TypeScript te marcará error aquí si UploadItemResponse no tiene uploadUrl, avísame si se llama diferente)
            if (!uploadItem || !uploadItem.uploadUrl || !idSesion) {
                throw new Error('La API no devolvió instrucciones de carga completas (faltan items o ID).');
            }
            // ---------------------------------------------------------
            // PASO 2: Subir el Archivo Binario (Directo a Cloud)
            // ---------------------------------------------------------

            // NOTA DE SEGURIDAD: Las Signed URLs suelen rechazar la petición si lleva
            // el header 'Authorization: Bearer ...' de tu API. 
            // Si tienes un Interceptor global, usa un HttpContext para saltártelo.

            await firstValueFrom(
                this.http.put(uploadItem.uploadUrl, archivo, {
                    headers: new HttpHeaders({
                        'Content-Type': archivo.type,
                        // 'x-ms-blob-type': 'BlockBlob' // Descomentar si usas Azure Storage
                    }),
                    // context: new HttpContext().set(IS_PUBLIC_API, true) // Descomentar si usas interceptor
                })
            );

            // ---------------------------------------------------------
            // PASO 3: Confirmar la Carga
            // ---------------------------------------------------------
            // Corrección: Usamos 'idSesion' (extraído de la raíz de la respuesta)
            const fileIdToConfirm = uploadItem.evidenceId; // <--- AJUSTA ESTE NOMBRE SI ES NECESARIO

            if (!fileIdToConfirm) {
                throw new Error('No se encontró el ID de la evidencia en la respuesta de la sesión.');
            }

            const confirmacion = await this.uploadsService.uploadsUploadIdConfirmarPost({
                uploadId: idSesion, // El ID de la sesión (del padre)
                body: {
                    // El error decía que faltaba 'evidenceIds'.
                    // Como es plural, enviamos un array con el ID de nuestro archivo.
                    evidenceIds: [fileIdToConfirm]
                }
            });
            // Asumiendo que la respuesta de confirmación contiene el ID final de la evidencia
            // O si el uploadId original es el EvidenceId.
            // return confirmacion as unknown as EvidenceId;
            return fileIdToConfirm as unknown as EvidenceId;
        } catch (error) {
            console.error('Error en el flujo de subida de evidencia:', error);
            // Relanzar un error limpio para la UI
            throw new Error('No se pudo completar la carga del archivo. Verifique su conexión e intente nuevamente.');
        }
    }
}
