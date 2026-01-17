import { Injectable, inject, signal } from '@angular/core';
import { EvidenciasService } from '@/core/api/evidencias/services/evidencias.service';
import { LoggerService } from '@/core/service/logging/logger.service';
import { UrlFirmadaResponse } from '@/core/api/evidencias/models/url-firmada-response';

@Injectable({ providedIn: 'root' })
export class EvidenceFacade {
    private readonly evidenciasService = inject(EvidenciasService);
    private readonly logger = inject(LoggerService);
    private readonly _loading = signal(false);
    readonly loading = this._loading.asReadonly();

    async getSignedUrl(evidenceId: string): Promise<UrlFirmadaResponse> {
        this._loading.set(true);

        this.logger.logInfo('EvidenceFacade', 'Fetching signed URL for evidence', { evidenceId });
        try {
            const response = await this.evidenciasService.evidenciasIdUrlFirmadaGet({ id: evidenceId });

            this.logger.logInfo('EvidenceFacade', 'Successfully fetched signed URL', { evidenceId });
            return response;
        } catch (error) {
            this.logger.logError('EvidenceFacade', 'Error fetching signed URL', {
                evidenceId,
                error
            });
            throw error;
        } finally {
            this._loading.set(false);
        }
    }
}
