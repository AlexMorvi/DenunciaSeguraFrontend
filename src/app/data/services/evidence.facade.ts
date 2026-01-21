import { Injectable, inject, signal } from '@angular/core';
import { InternoService } from '@/core/api/evidencias/services/interno.service';
import { LoggerService } from '@/core/service/logging/logger.service';
import { EvidenciaInternaResponse } from '@/core/api/evidencias/models/evidencia-interna-response';
import { CrearIntencionDeCarga$Params } from '@/core/api/evidencias/fn/interno/crear-intencion-de-carga';
import { ConfirmarCarga$Params } from '@/core/api/evidencias/fn/interno/confirmar-carga';
import { AdjuntarEvidencias$Params } from '@/core/api/evidencias/fn/interno/adjuntar-evidencias';
import { ObtenerEvidencias$Params } from '@/core/api/evidencias/fn/interno/obtener-evidencias';

@Injectable({ providedIn: 'root' })
export class EvidenceFacade {
    private readonly internoService = inject(InternoService);
    private readonly logger = inject(LoggerService);

    private readonly _loading = signal(false);
    private readonly _error = signal<string | null>(null);

    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    async createUploadIntent(params: CrearIntencionDeCarga$Params): Promise<EvidenciaInternaResponse> {
        this._loading.set(true);
        this.logger.logInfo('EvidenceFacade', 'Creating upload intent', params);

        try {
            const result = await this.internoService.crearIntencionDeCarga(params);
            this._error.set(null);
            return result;
        } catch (error: any) {
            const msg = error?.message || 'Error creating upload intent';
            this.logger.logError('EvidenceFacade', msg, { error });
            this._error.set(msg);
            throw error;
        } finally {
            this._loading.set(false);
        }
    }

    async confirmUpload(params: ConfirmarCarga$Params): Promise<void> {
        this._loading.set(true);
        this.logger.logInfo('EvidenceFacade', 'Confirming upload', params);

        try {
            await this.internoService.confirmarCarga(params);
            this._error.set(null);
        } catch (error: any) {
            const msg = error?.message || 'Error confirming upload';
            this.logger.logError('EvidenceFacade', msg, { error });
            this._error.set(msg);
            throw error;
        } finally {
            this._loading.set(false);
        }
    }

    async attachEvidences(params: AdjuntarEvidencias$Params): Promise<void> {
        this._loading.set(true);
        this.logger.logInfo('EvidenceFacade', 'Attaching evidences', params);

        try {
            await this.internoService.adjuntarEvidencias(params);
            this._error.set(null);
        } catch (error: any) {
            const msg = error?.message || 'Error attaching evidences';
            this.logger.logError('EvidenceFacade', msg, { error });
            this._error.set(msg);
            throw error;
        } finally {
            this._loading.set(false);
        }
    }

    async getEvidences(params: ObtenerEvidencias$Params): Promise<EvidenciaInternaResponse[]> {
        this._loading.set(true);
        this.logger.logInfo('EvidenceFacade', 'Fetching evidences', params);

        try {
            const result = await this.internoService.obtenerEvidencias(params);
            this._error.set(null);
            return result;
        } catch (error: any) {
            const msg = error?.message || 'Error fetching evidences';
            this._error.set(msg);
            throw error;
        } finally {
            this._loading.set(false);
        }
    }
}
