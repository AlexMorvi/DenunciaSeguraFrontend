import { Component, input, output, inject, ChangeDetectionStrategy, computed, effect } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiStyleDirective } from '@/shared/style/ui-styles.directive';
import { SelectComponent } from '@/shared/ui/select/select.component';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { faCheckCircle, faComment, faUsers, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastService } from '@/core/service/toast/toast.service';
import { InputComponent } from '@/shared/ui/input/input.component';
import { DenunciaResponse } from '@/core/api/denuncias/models';
import { StaffFacade } from '@/data/services/staff.facade';

@Component({
    selector: 'app-actions-jefe',
    standalone: true,
    imports: [ReactiveFormsModule, UiStyleDirective, SelectComponent, SubmitButtonComponent, InputComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './actions-jefe.component.html'
})
export class ActionsJefeComponent {
    private readonly fb = inject(FormBuilder);
    private readonly toast = inject(ToastService);
    private readonly staffFacade = inject(StaffFacade);

    protected readonly faCheck = faCheckCircle;
    protected readonly faComment = faComment;
    protected readonly faUsers = faUsers;
    protected readonly faTimes = faTimesCircle;

    // onAssignmentComplete = output<void>();
    validar = output<{ aprobada: boolean, comentario?: string }>();
    asignar = output<{ idOperador: number }>();

    // TODO: Eliminar el signal true y utilizar el dinámico
    isEnValidacion = computed(() => this.currentDenuncia().estadoDenuncia === 'EN_VALIDACION');

    operadores = computed(() =>
        this.staffFacade.operadores().map(op => ({
            id: op.id!,
            label: `${op.cedula} - ${op.nombre}`
        }))
    );

    currentDenuncia = input.required<DenunciaResponse>();
    public isLoading = input<boolean>(false);

    constructor() {
        effect(() => {
            const denuncia = this.currentDenuncia();
            if (denuncia?.entidadResponsable) {
                this.staffFacade.loadOperadoresPorEntidad(denuncia.entidadResponsable);
            }
        });
    }

    readonly form = this.fb.nonNullable.group({
        operadorId: new FormControl(0, {
            nonNullable: true,
            validators: [Validators.required, Validators.min(1)]
        }),

        comentarioObservacion: new FormControl('', {
            nonNullable: true,
            validators: [Validators.minLength(10), Validators.maxLength(500)]
        })
    });

    async asignarOperadorPorJefe() {
        if (this.form.invalid) return;

        const operadorId = Number(this.form.controls['operadorId'].value);

        if (Number.isNaN(operadorId)) {
            this.toast?.showWarning('Operador inválido');
            return;
        }

        this.asignar.emit({
            idOperador: operadorId
        });
    }

    async validarDenunciaPorJefe(aprobada = true) {
        if (this.form.invalid) return;

        const comentarioObservacion = this.form.controls['comentarioObservacion'].value ?? '';
        this.validar.emit({ aprobada, comentario: comentarioObservacion });
    }
}
