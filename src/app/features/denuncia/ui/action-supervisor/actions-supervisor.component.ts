import { Component, input, output, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthFacade } from '@/data/services/auth.facade';
import { DenunciaStaffViewResponse } from '@/core/api/denuncias/models';
import { UiStyleDirective } from '@/shared/style/ui-styles.directive';
import { SelectComponent } from '@/shared/ui/select/select.component';
import { ENTIDAD_ENUM } from '@/core/api/auth/models/entidad-enum-array';
import { EntidadEnum } from '@/core/api/auth/models/entidad-enum';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { faSave, faComment } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-actions-supervisor',
    standalone: true,
    imports: [ReactiveFormsModule, UiStyleDirective, SelectComponent, SubmitButtonComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './actions-supervisor.component.html'
})
export class ActionsSupervisorComponent {
    private fb = inject(FormBuilder);
    auth = inject(AuthFacade);

    protected readonly faSave = faSave;
    protected readonly faComment = faComment;

    // Accept options from parent via `input`; fallback to generated `ENTIDAD_ENUM`
    entidadesOptionsInput = input<EntidadEnum[] | null>();
    entidadesOptions = computed(() => this.entidadesOptionsInput() ?? ENTIDAD_ENUM);
    public isLoading = input<boolean>(false);

    // TODO: una vez corregido el contrato utilizar el tipo correcto
    // currentDenuncia = input.required<DenunciaStaffViewResponse>();
    currentDenuncia = input.required<any>();

    asignar = output<{ idDenuncia: number, entidadId: number }>();

    form = this.fb.nonNullable.group({
        entidadId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    });

    async asignarJefePorSupervisor() {
        const denuncia = this.currentDenuncia();
        if (!denuncia || !denuncia.id) return;

        if (!this.form.valid) {
            this.form.markAllAsTouched();
            return;
        }

        const entidadId = Number(this.form.getRawValue().entidadId);

        this.asignar.emit({ idDenuncia: denuncia.id, entidadId });
    }
}
