import { EvidenceId } from '@/core/api/denuncias/models';
import { HttpClient, HttpContext, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { LoggerService } from './logging/logger.service';
import { firstValueFrom, retry, timeout } from 'rxjs';
import { CrearUploadRequest } from '@/core/api/evidencias/models/crear-upload-request';
import { UploadsService } from '../api/evidencias/services';
import { SKIP_AUTH } from '../http/http-context';
import { EvidenceUploadError } from '../errors/create-denuncia.errors';

type UploadPhase = 'INICIO' | 'SESION' | 'CARGA_NUBE' | 'CONFIRMACION';
const PROPOSITO_CARGA = 'CIUDADANO_CREACION';

@Injectable({ providedIn: 'root' })
export class FileUploadService {
    private http = inject(HttpClient);
    private logger = inject(LoggerService);
    private uploadsService = inject(UploadsService);

    async subirEvidencia(archivo: File): Promise<EvidenceId> {
        let currentStep: UploadPhase = 'INICIO';
        let sessionData: { uploadUrl: string; uploadId: string; evidenceId: string } | null = null;

        try {
            currentStep = 'SESION';
            sessionData = await this.iniciarSesionCarga(archivo);

            currentStep = 'CARGA_NUBE';
            await this.cargarArchivoEnNube(sessionData.uploadUrl, archivo);

            currentStep = 'CONFIRMACION';
            await this.confirmarSubida(sessionData.uploadId, sessionData.evidenceId);

            return sessionData.evidenceId;

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

    private extractErrorMessage(e: unknown): string {
        try {
            if (e instanceof Error) return e.message;
            if (typeof e === 'string') return e;
            return JSON.stringify(e);
        } catch {
            return String(e);
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
        await firstValueFrom(
            this.http.put(url, archivo, {
                // TODO: revisar si los headers de http son seguros
                headers: new HttpHeaders({
                    'Content-Type': archivo.type
                }),
                context: new HttpContext().set(SKIP_AUTH, true),
                reportProgress: true,
                observe: 'events'
            }).pipe(
                retry({ count: 2, delay: 1000 }),
                timeout(120000)
            )
        );

    }

    private async confirmarSubida(uploadId: string, evidenceId: string): Promise<void> {
        await this.uploadsService.uploadsUploadIdConfirmarPost({
            uploadId,
            body: { evidenceIds: [evidenceId] }
        });
    }

    private handleUploadError(fase: UploadPhase, detalles: string): EvidenceUploadError {
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
}
