import { Component, input, computed, signal, effect, untracked } from '@angular/core';
import { NgOptimizedImage, CommonModule } from '@angular/common';

@Component({
    selector: 'app-secure-image',
    standalone: true,
    imports: [CommonModule, NgOptimizedImage],
    templateUrl: './img.component.html',
})
export class SecureImageComponent {
    src = input.required<string>();
    width = input<number>(160); // INFO: 160 = w-40
    height = input<number>(160);

    loadError = signal<string | null>(null);

    safeUrl = computed(() => this.validationState().url);

    displayError = computed(() => this.validationState().error || this.loadError());

    constructor() {
        effect(() => {
            this.src();
            untracked(() => this.loadError.set(null));
        });
    }

    handleError() {
        this.loadError.set('Imagen no disponible o expirada');
    }

    private validationState = computed(() => {
        const rawUrl = this.src();

        if (!rawUrl.startsWith('https://')) {
            // TODO: En desarrollo localhost podría ser http, ajusta según environment
            // TODO: Loggear correctamente este incidente
            console.warn('[Security] Bloqueado (No HTTPS):', rawUrl);
            return { url: null, error: 'Fuente no segura' };
        }

        try {
            const urlObj = new URL(rawUrl);
            // TODO: añadir el url de los dominios permitidos en producción
            const allowList = ['tu-bucket.s3.amazonaws.com', 'api.tudominio.com', 'storage.googleapis.com'];

            const isAllowed = allowList.some(domain => urlObj.hostname.includes(domain));

            if (!isAllowed) {
                // TODO: Loggear correctamente este incidente
                console.warn('[Security] Dominio no autorizado:', urlObj.hostname);
                return { url: null, error: 'Dominio externo no permitido' };
            }

            return { url: rawUrl, error: null };

        } catch (e) {
            // TODO: Loguear correctamente esto
            return { url: null, error: 'URL mal formada' };
        }
    });
}
