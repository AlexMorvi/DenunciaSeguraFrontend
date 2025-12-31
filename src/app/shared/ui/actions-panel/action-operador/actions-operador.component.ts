// components/actions-panel/actions-panel.component.ts
import { Component, input, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthFacade } from '@/data/services/auth.facade';
import { DenunciaStaffViewResponse } from '@/core/api/denuncias/models';
import { UiStyleDirective } from '@/shared/style/ui-styles.directive';
import { SelectComponent } from '@/shared/ui/select/select.component';
import { ENTIDAD_ENUM } from '@/core/api/auth/models/entidad-enum-array';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { faSave } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-actions-operador',
    standalone: true,
    imports: [ReactiveFormsModule, UiStyleDirective, SelectComponent, SubmitButtonComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './actions-operador.component.html'
})
export class ActionsOperadorComponent {
    auth = inject(AuthFacade);
    protected readonly faSave = faSave;

    // Recibimos la denuncia actual para ver su estado (ej. si ya es urgente)
    // currentDenuncia = input.required<DenunciaStaffViewResponse>();

    // Outputs para comunicar al Smart Component que algo pasó
    onUpdateStatus = output<{ prioridad: string }>();
    onSaveAssignment = output<string>();

    notasControl = new FormControl('', { nonNullable: true });
    entidadControl = new FormControl('', { nonNullable: true });

    entidadesOptions = ENTIDAD_ENUM;

    toggleUrgency() {
        // Emitimos evento, NO mutamos la data aquí
        // const nuevaPrioridad = this.currentDenuncia().prioridad === 'Alta' ? 'Media' : 'Alta';
        // this.onUpdateStatus.emit({ prioridad: nuevaPrioridad });
    }

    guardarAccion() {
        this.onSaveAssignment.emit(this.notasControl.value);
        this.notasControl.reset();
    }
}
