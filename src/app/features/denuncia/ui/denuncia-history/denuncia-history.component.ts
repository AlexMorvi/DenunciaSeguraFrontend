import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { DenunciaEstadoHistorialResponse } from '@/core/api/denuncias/models';
import { UiStyleDirective } from '@/shared/style/ui-styles.directive';
import { ESTADO_BADGE_CLASSES, ESTADO_DOT_CLASSES, ESTADO_RING_CLASSES } from '@/shared/constants/estados.const';

@Component({
    selector: 'app-denuncia-history',
    standalone: true,
    imports: [CommonModule, UiStyleDirective, DatePipe, TitleCasePipe],
    templateUrl: './denuncia-history.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DenunciaHistoryComponent {
    historial = input<DenunciaEstadoHistorialResponse | null>(null);
    isLoading = input<boolean>(false);
    currentStatus = input<string | undefined>(undefined);

    getBadgeClass(estado?: string): string {
        return ESTADO_BADGE_CLASSES[estado as string] || 'bg-gray-100 text-gray-800';
    }

    getRingClass(estado?: string): string {
        return ESTADO_RING_CLASSES[estado as string] || 'bg-gray-100 border-gray-200';
    }

    getDotClass(estado?: string): string {
        return ESTADO_DOT_CLASSES[estado as string] || 'bg-gray-600';
    }
}
