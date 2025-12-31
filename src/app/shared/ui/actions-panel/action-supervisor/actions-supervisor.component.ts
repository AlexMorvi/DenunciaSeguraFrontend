// components/actions-panel/actions-panel.component.ts
import { Component, input, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthFacade } from '@/data/services/auth.facade';
import { DenunciaStaffViewResponse } from '@/core/api/denuncias/models';
import { UiStyleDirective } from '@/shared/style/ui-styles.directive';
import { SelectComponent } from '@/shared/ui/select/select.component';
import { ENTIDAD_ENUM } from '@/core/api/auth/models/entidad-enum-array';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { faSave } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-actions-supervisor',
    standalone: true,
    imports: [ReactiveFormsModule, UiStyleDirective, SelectComponent, SubmitButtonComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './actions-supervisor.component.html'
})
export class ActionsSupervisorComponent {
    auth = inject(AuthFacade);
    protected readonly faSave = faSave;

    // TODO: una vez corregido el contrato utilizar el tipo correcto
    // currentDenuncia = input.required<DenunciaStaffViewResponse>();
    currentDenuncia = input.required<any>();

    // Outputs para comunicar al Smart Component que algo pasó
    onUpdateStatus = output<{ prioridad: string }>();

    entidadesOptions = ENTIDAD_ENUM;

    saveAssignment = output<{ entidadId: string, comments: string }>();

    form = new FormGroup({
        entidadId: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required]
        }),
        comments: new FormControl('', { nonNullable: true })
    });

    onSubmit() {
        if (this.form.valid) {
            // Extraemos los valores ya tipados y limpios
            const { entidadId, comments: comments } = this.form.getRawValue();

            this.saveAssignment.emit({
                entidadId,
                comments
            });

            // Opcional: Resetear form
            // this.form.reset(); 
        }
    }

    toggleUrgency() {
        // Emitimos evento, NO mutamos la data aquí
        // const nuevaPrioridad = this.currentDenuncia().prioridad === 'Alta' ? 'Media' : 'Alta';
        // this.onUpdateStatus.emit({ prioridad: nuevaPrioridad });
    }
}
