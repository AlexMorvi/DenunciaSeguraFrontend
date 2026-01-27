import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DenunciaEstadoHistorialResponse } from '@/core/api/denuncias/models';
import { UiStyleDirective } from '@/shared/style/ui-styles.directive';

@Component({
    selector: 'app-denuncia-history',
    standalone: true,
    imports: [CommonModule, UiStyleDirective],
    templateUrl: './denuncia-history.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DenunciaHistoryComponent {
    historial = input<DenunciaEstadoHistorialResponse | null>(null);
    isLoading = input<boolean>(false);
}
