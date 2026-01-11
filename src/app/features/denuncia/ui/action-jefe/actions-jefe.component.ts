// components/actions-panel/actions-panel.component.ts
import { Component, input, output, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DenunciaStaffViewResponse } from '@/core/api/denuncias/models';
import { UiStyleDirective } from '@/shared/style/ui-styles.directive';
import { SelectComponent } from '@/shared/ui/select/select.component';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { faCheckCircle, faComment, faUsers, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastService } from '@/core/service/toast/toast.service';
import { InputComponent } from '@/shared/ui/input/input.component';

@Component({
    selector: 'app-actions-jefe',
    standalone: true,
    imports: [ReactiveFormsModule, UiStyleDirective, SelectComponent, SubmitButtonComponent, InputComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './actions-jefe.component.html'
})
export class ActionsJefeComponent {
    private fb = inject(FormBuilder);
    private toast = inject(ToastService);

    protected readonly faCheck = faCheckCircle;
    protected readonly faComment = faComment;
    protected readonly faUsers = faUsers;
    protected readonly faTimes = faTimesCircle;

    // onAssignmentComplete = output<void>();
    validar = output<{ idDenuncia: number, aprobada: boolean, comentario?: string }>();
    rechazar = output<{ idDenuncia: number, aprobada: boolean, comentario?: string }>();
    asignar = output<{ idDenuncia: number, idOperador: number }>();

    // TODO: Eliminar el signal true y utilizar el dinámico
    // isEnValidacion = computed(() => this.currentDenuncia().estado === 'EN_VALIDACION');
    isEnValidacion = signal(false);

    // TODO: Cargar lista real de operadores desde un servicio
    // Ahora `operadores` es un arreglo de objetos con `id` y `label`.
    operadores = signal<{ id: number; label: string }[]>([
        { id: 1, label: '1 - Operador Alpha' },
        { id: 2, label: '2 - Operador Bravo' },
        { id: 3, label: '3 - Operador Charlie' }
    ]);

    // TODO: Utilizar la denuncia actual que envía denuncia page
    // currentDenuncia = input.required<DenunciaStaffViewResponse>();
    currentDenuncia = input.required<any>();
    public isLoading = input<boolean>(false);

    form = this.fb.nonNullable.group({
        operadorId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        comentarios: ['', [Validators.minLength(10), Validators.maxLength(500)]]
    });

    async asignarOperadorPorJefe() {
        const denuncia = this.currentDenuncia();
        if (!denuncia || !denuncia.id) return;

        if (this.form.invalid) return;

        const operadorId = Number(this.form.controls['operadorId'].value);

        if (Number.isNaN(operadorId)) {
            this.toast?.showWarning('Operador inválido');
            return;
        }

        this.asignar.emit({
            idDenuncia: denuncia.id,
            idOperador: operadorId
        });
    }

    async validarDenunciaPorJefe(aprobada = true) {
        const denuncia = this.currentDenuncia();
        if (!denuncia?.id) return;

        if (!denuncia?.id || this.form.invalid) return;

        const comentario = this.form.controls['comentarios'].value ?? '';
        this.validar.emit({ idDenuncia: denuncia.id, aprobada, comentario: comentario });
    }
}
