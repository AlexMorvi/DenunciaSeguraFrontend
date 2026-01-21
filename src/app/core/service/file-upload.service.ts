import { HttpClient, HttpContext, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { LoggerService } from './logging/logger.service';
import { catchError, firstValueFrom, from, retry, throwError, timeout, timer } from 'rxjs';
import { SKIP_AUTH } from '../http/http-context';
import { EvidenceUploadError } from '../errors/create-denuncia.errors';
import { InternoService } from '@/core/api/evidencias/services/interno.service';
import { CrearIntencionDeCarga$Params } from '@/core/api/evidencias/fn/interno/crear-intencion-de-carga';

type UploadPhase = 'INICIO' | 'SESION' | 'CARGA_NUBE' | 'CONFIRMACION';

@Injectable({ providedIn: 'root' })
export class FileUploadService {
    private readonly http = inject(HttpClient);
    private readonly logger = inject(LoggerService);
    private readonly internoService = inject(InternoService);

    async subirEvidencia(archivo: File): Promise<string> {
        let currentStep: UploadPhase = 'INICIO';
        let sessionData: { uploadUrl: string; uploadId: string; contentType: string; sizeBytes: number } | null = null;

        try {
            currentStep = 'SESION';
            sessionData = await this.iniciarSesionCarga(archivo);

            currentStep = 'CARGA_NUBE';
            await this.cargarArchivoEnNube(sessionData, archivo);

            currentStep = 'CONFIRMACION';
            await this.confirmarSubida(sessionData.uploadId);

            return sessionData.uploadId;

        } catch (error) {
            const errorDetails = this.extractErrorMessage(error);

            this.logger.logError(`Fallo en orquestación (${currentStep})`, {
                fileName: archivo.name,
                fileSize: archivo.size,
                uploadId: sessionData?.uploadId ?? 'N/A',
                errorRaw: errorDetails
            });

            throw this.handleUploadError(currentStep, errorDetails);
        }
    }

    private async iniciarSesionCarga(archivo: File) {
        const params: CrearIntencionDeCarga$Params = {
            filename: archivo.name,
            contentType: archivo.type,
            size: archivo.size
        };


        const response = await this.internoService.crearIntencionDeCarga(params);

        // Envolvemos la llamada (que es una Promesa) en un Observable para usar los operadores de RxJS
        // const response = await firstValueFrom(
        //     from(this.internoService.crearIntencionDeCarga(params)).pipe(
        //         // Configuración de Retry:
        //         retry({
        //             count: 2, // Reintentar 2 veces más (total 3 intentos)
        //             delay: (error, retryCount) => {
        //                 console.warn(`Intento de sesión fallido (${retryCount}). Reintentando...`, error);
        //                 return timer(1000); // Esperar 1 segundo entre intentos
        //             }
        //         }),
        //         // Timeout de seguridad por si el backend se queda colgado
        //         timeout(10000),
        //         catchError(err => {
        //             return throwError(() => err);
        //         })
        //     )
        // );

        if (!response.id || !response.url) {
            throw new Error('La sesión de carga no devolvió los datos requeridos (URL o ID faltantes).');
        }

        return {
            uploadId: response.id,
            uploadUrl: response.url,
            contentType: archivo.type,
            sizeBytes: archivo.size
        };
    }

    private async cargarArchivoEnNube(sessionData: { uploadUrl: string; uploadId: string; contentType: string; sizeBytes: number }, archivo: File): Promise<void> {
        // Eliminamos 'Content-Length' (el navegador lo pone solo y es más seguro)
        const headers = new HttpHeaders({
            'Content-Type': sessionData.contentType
        });

        await firstValueFrom(
            this.http.put(sessionData.uploadUrl, archivo, {
                headers: headers,
                context: new HttpContext().set(SKIP_AUTH, true)
                // Quitamos observe: 'events' y reportProgress: true
            }).pipe(
                retry({ count: 2, delay: 1000 }),
                timeout(120000)
            )
        );
    }

    private async confirmarSubida(uploadId: string): Promise<void> {
        await this.internoService.confirmarCarga({ id: uploadId });
    }

    private handleUploadError(fase: UploadPhase, _detalles: string): EvidenceUploadError {
        switch (fase) {
            case 'SESION':
                return new EvidenceUploadError('El sistema no pudo autorizar la carga. Verifique el formato del archivo.');

            case 'CARGA_NUBE':
                return new EvidenceUploadError('Se interrumpió la conexión al subir el archivo. Verifique su internet e intente de nuevo.');

            case 'CONFIRMACION':
                return new EvidenceUploadError('El archivo se subió, pero hubo un error al validarlo. Por favor intente guardar nuevamente.');

            default:
                return new EvidenceUploadError('Error inesperado al procesar la evidencia.');
        }
    }

    private extractErrorMessage(e: unknown): string {
        try {
            if (e instanceof Error) return e.message;
            if (typeof e === 'string') return e;
            return JSON.stringify(e);
        } catch {
            return String(e);
        }
    }
}
