import { Component, input, ChangeDetectionStrategy, computed } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faImages, faVideo } from '@fortawesome/free-solid-svg-icons';
import { SecureImageComponent } from '@/shared/ui/img/img.component';
import { EvidenciaDto } from '@/core/api/denuncias/models';
export type EvidenceEmptyKey = 'ciudadano' | 'operador';

@Component({
    selector: 'app-evidencia-viewer',
    standalone: true,
    imports: [FontAwesomeModule, SecureImageComponent],
    templateUrl: './evidencia-viewer.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EvidenciaViewerComponent {
    evidencias = input<EvidenciaDto[] | undefined>([]);
    emptyStateKey = input<EvidenceEmptyKey>('ciudadano');

    protected readonly faImages = faImages;
    protected readonly faVideo = faVideo;

    private readonly emptyMessages: Record<EvidenceEmptyKey, string> = {
        'ciudadano': 'El ciudadano/a no adjuntó fotografías al momento de crear la denuncia. La denuncia se sustenta en la descripción proporcionada.',
        'operador': 'El operador/a no adjuntó fotografías al momento de resolver la denuncia.',
    };

    emptyStateMessage = computed(() => {
        const key = this.emptyStateKey();
        return this.emptyMessages[key] ?? this.emptyMessages['ciudadano'];
    });

    gridClass = computed(() => {
        const count = this.evidencias()?.length ?? 0;
        switch (count) {
            case 1: return 'grid-cols-1';
            case 2: return 'grid-cols-2';
            default: return 'grid-cols-2 grid-rows-2';
        }
    });
}
