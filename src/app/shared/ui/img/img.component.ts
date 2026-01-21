import { Component, input, computed, signal, effect, untracked, output, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage, CommonModule } from '@angular/common';
import { ImgEvent } from '@/core/model/app.event';

const ALLOWED_DOMAINS = ['tu-bucket.s3.amazonaws.com', 'wgqripvsznlcmrgitkqp.supabase.co', 'storage.googleapis.com'];

@Component({
    selector: 'app-secure-image',
    standalone: true,
    imports: [CommonModule, NgOptimizedImage],
    templateUrl: './img.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecureImageComponent {
    src = input.required<string | undefined>();
    width = input<number>(160);
    height = input<number>(160);

    uploadError = output<ImgEvent>();

    private readonly browserLoadError = signal<string | null>(null);

    private readonly validationResult = computed(() => {
        const rawUrl = this.src();

        if (!rawUrl) {
            return {
                isValid: false,
                userMsg: 'URL de imagen no proporcionada',
                techMsg: 'Security Block: Missing URL',
                reason: 'missing_url'
            };
        }

        if (!rawUrl.startsWith('https://')) {
            return {
                isValid: false,
                userMsg: 'Fuente no segura (No HTTPS)',
                techMsg: 'Security Block: Mixed Content/Non-HTTPS',
                reason: 'protocol_violation'
            };
        }

        try {
            const urlObj = new URL(rawUrl);

            const isAllowed = ALLOWED_DOMAINS.some(domain =>
                urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
            );

            if (!isAllowed) {
                return {
                    isValid: false,
                    userMsg: 'Dominio externo no permitido',
                    techMsg: `Security Block: Unauthorized Domain (${urlObj.hostname})`,
                    reason: 'domain_policy'
                };
            }

            return { isValid: true, url: rawUrl, userMsg: null, techMsg: null, reason: null };
        } catch {
            return {
                isValid: false,
                userMsg: 'URL inválida',
                techMsg: 'Security Block: Malformed URL',
                reason: 'malformed_url'
            };
        }
    });

    safeUrl = computed(() => this.validationResult().isValid ? this.validationResult().url : null);
    displayError = computed(() => this.validationResult().userMsg || this.browserLoadError());

    constructor() {
        effect(() => {
            const result = this.validationResult();

            untracked(() => {
                if (result.isValid) {
                    this.browserLoadError.set(null);
                    return;
                }
                this.emitErrorEvent(
                    result.userMsg!,
                    result.techMsg!,
                    result.reason!,
                    this.src() ?? ''
                );
            });
        });
    }

    handleLoadError() {
        const msg = 'Imagen no disponible';
        this.browserLoadError.set(msg);
        this.emitErrorEvent(msg, 'Image Resource Not Found (404/Network)', 'network_error', this.src() ?? '');
    }

    private emitErrorEvent(userMsg: string, techMsg: string, reason: string, url: string) {
        const event: ImgEvent = {
            userMessage: userMsg,
            technicalMessage: techMsg,
            severity: 'WARNING',
            logData: {
                format: reason,
                url: url
            }
        };
        this.uploadError.emit(event);
    }
}
