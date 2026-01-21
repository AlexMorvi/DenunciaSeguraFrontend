import { HttpClient, HttpContext, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { firstValueFrom, retry, timeout } from 'rxjs';
import { SKIP_AUTH } from '../http/http-context';
import { InternoService } from '@/core/api/evidencias/services/interno.service';
import { CrearIntencionDeCarga$Params } from '@/core/api/evidencias/fn/interno/crear-intencion-de-carga';


@Injectable({ providedIn: 'root' })
export class FileUploadService {
    private readonly http = inject(HttpClient);
    private readonly internoService = inject(InternoService);

    async subirEvidencia(archivo: File): Promise<string> {
        let sessionData: { uploadUrl: string; uploadId: string; contentType: string; sizeBytes: number } | null = null;

        sessionData = await this.iniciarSesionCarga(archivo);

        await this.cargarArchivoEnNube(sessionData, archivo);

        await this.confirmarSubida(sessionData.uploadId);

        return sessionData.uploadId;

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
